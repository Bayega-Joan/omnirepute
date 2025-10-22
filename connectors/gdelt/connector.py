from datetime import datetime, timedelta, timezone
import csv, io, json, math, time, zipfile
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from fivetran_connector_sdk import Connector, Operations as op, Logging as log

#helpers
def _as_int(v, default):
    try:
        return int(v)
    except Exception:
        try:
            return int(float(v))
        except Exception:
            return default

def _as_list(v, default=None):
    if v is None:
        return default or []
    if isinstance(v, list):
        return [str(x) for x in v]
    if isinstance(v, str):
        s = v.strip()
        if not s:
            return []
        if s.startswith("[") and s.endswith("]"):
            try:
                arr = json.loads(s)
                return [str(x) for x in arr]
            except Exception:
                pass
        return [p.strip() for p in s.split(",") if p.strip()]
    return default or []

def _floor_to_interval(dt: datetime, minutes: int) -> datetime:
    minute_block = (dt.minute // minutes) * minutes
    return dt.replace(minute=minute_block, second=0, microsecond=0)

def _gdelt_ts(dt: datetime) -> str:
    return dt.strftime("%Y%m%d%H%M%S")

def _contains_term(text: str, term: str) -> bool:
    return term.lower() in (text or "").lower()

def _parse_v2tone(v2tone: str):
    try:
        first = float((v2tone or "").split(",")[0])
        if math.isfinite(first):
            return first
    except Exception:
        pass
    return None

def _make_session(user_agent: str):
    s = requests.Session()
    retries = Retry(
        total=4,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retries)
    s.headers.update({"User-Agent": user_agent})
    s.mount("http://", adapter)
    s.mount("https://", adapter)
    return s

#Fivetran SDK: schema
def schema(configuration: dict):
    return [{
        "table": "gkg_mentions",
        "primary_key": ["pk"],
        "column": {
            "pk": "STRING",
            "gkg_record_id": "STRING",
            "brand": "STRING",
            "date_utc": "UTC_DATETIME",
            "source_domain": "STRING",
            "doc_url": "STRING",
            "tone": "FLOAT",
            "v2persons": "STRING",
            "v2organizations": "STRING",
            "v2themes": "STRING",
            "v2locations": "STRING",
            "retrieved_at": "UTC_DATETIME",
            "file_timestamp_utc": "UTC_DATETIME"
        }
    }]

#Fivetran SDK: update
def update(configuration: dict, state: dict):
    brand_terms   = _as_list(configuration.get("brand_terms"), [])
    lookback_days = _as_int(configuration.get("lookback_days"), 7)
    max_files     = _as_int(configuration.get("max_files"), 48)
    interval_min  = max(1, _as_int(configuration.get("interval_minutes"), 15))
    user_agent    = (configuration.get("user_agent") or "omnirepute/1.0").strip()
    scheme        = (configuration.get("scheme") or "http").strip().lower()
    if scheme not in ("http", "https"):
        scheme = "http"

    base = f"{scheme}://data.gdeltproject.org/gdeltv2"

    log.info(f"GDELT GKG start; brands={brand_terms}, lookback_days={lookback_days}, "
             f"max_files={max_files}, interval={interval_min}min, scheme={scheme}")

    session = _make_session(user_agent)

    now = datetime.now(timezone.utc)
    state = state or {}
    cursor_iso = state.get("last_ts_utc")
    if cursor_iso:
        since = datetime.fromisoformat(cursor_iso.replace("Z", "+00:00"))
    else:
        since = now - timedelta(days=lookback_days)

    start = _floor_to_interval(since, interval_min)
    end   = _floor_to_interval(now, interval_min)
    if start == since:
        start = start + timedelta(minutes=interval_min)

    timestamps = []
    t = start
    while t <= end and len(timestamps) < max_files:
        timestamps.append(t)
        t = t + timedelta(minutes=interval_min)

    processed_up_to = None

    for ts in timestamps:
        ts_str = _gdelt_ts(ts)
        url = f"{base}/{ts_str}.gkg.csv.zip"
        log.info(f"Fetching {url}")

        try:
            r = session.get(url, timeout=60)
        except requests.exceptions.SSLError as e:
            #gracefully fall back to http
            if scheme == "https":
                http_url = f"http://data.gdeltproject.org/gdeltv2/{ts_str}.gkg.csv.zip"
                log.warn(f"SSL error on HTTPS; retrying via HTTP once: {e}")
                r = session.get(http_url, timeout=60)
            else:
                raise

        if r.status_code == 404:
            log.info(f"{url} not available (404); skipping")
            processed_up_to = ts
            op.checkpoint(state=json.dumps({"last_ts_utc": processed_up_to.isoformat().replace("+00:00","Z")}))
            continue

        r.raise_for_status()

        # unzip > parse TSV
        with zipfile.ZipFile(io.BytesIO(r.content)) as zf:
            name = zf.namelist()[0]
            with zf.open(name) as fh:
                # Use UTF-8 with replacement for any invalid bytes
                text = io.TextIOWrapper(fh, encoding="utf-8", errors="replace", newline="")
                reader = csv.reader(text, delimiter="\t")
                for row in reader:
                    if not row:
                        continue

                    # Defensive indexing
                    gkg_record_id   = row[0] if len(row) > 0 else None
                    date_num        = row[1] if len(row) > 1 else None
                    source_common   = row[3] if len(row) > 3 else None
                    doc_url         = row[4] if len(row) > 4 else None
                    v2themes        = row[8] if len(row) > 8 else None
                    v2locations     = row[10] if len(row) > 10 else None
                    v2persons       = row[12] if len(row) > 12 else None
                    v2orgs          = row[14] if len(row) > 14 else None
                    # V2Tone tends to be at index 16; fall back to 15 for older rows
                    v2tone_field    = row[16] if len(row) > 16 else (row[15] if len(row) > 15 else None)

                    try:
                        dt = datetime.strptime(date_num, "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
                    except Exception:
                        dt = ts

                    blob = " ".join(filter(None, [doc_url, v2persons, v2orgs, v2themes]))
                    if not blob:
                        continue

                    for term in brand_terms:
                        if term and _contains_term(blob, term):
                            tone = _parse_v2tone(v2tone_field)
                            pk = f"{gkg_record_id}|{term}"
                            op.upsert(
                                table="gkg_mentions",
                                data={
                                    "pk": pk,
                                    "gkg_record_id": gkg_record_id,
                                    "brand": term,
                                    "date_utc": dt,
                                    "source_domain": source_common,
                                    "doc_url": doc_url,
                                    "tone": tone,
                                    "v2persons": v2persons,
                                    "v2organizations": v2orgs,
                                    "v2themes": v2themes,
                                    "v2locations": v2locations,
                                    "retrieved_at": datetime.now(timezone.utc),
                                    "file_timestamp_utc": ts
                                }
                            )

        processed_up_to = ts
        op.checkpoint(state=json.dumps({"last_ts_utc": processed_up_to.isoformat().replace("+00:00","Z")}))
        time.sleep(0.2)

    log.info("GDELT GKG complete")

connector = Connector(update=update, schema=schema)
