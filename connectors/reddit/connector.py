from datetime import datetime, timedelta, timezone
import json
import time
import requests

from fivetran_connector_sdk import Connector
from fivetran_connector_sdk import Operations as op
from fivetran_connector_sdk import Logging as log

TOKEN_URL = "https://www.reddit.com/api/v1/access_token"
SEARCH_URL = "https://oauth.reddit.com/search"

def schema(configuration: dict):
    return [{
        "table": "reddit_posts",
        "primary_key": ["post_id"],
        "column": {
            "post_id": "STRING",
            "brand": "STRING",
            "created_utc": "UTC_DATETIME",
            "subreddit": "STRING",
            "author": "STRING",
            "title": "STRING",
            "selftext": "STRING",
            "score": "INT",
            "num_comments": "INT",
            "url": "STRING",
            "permalink": "STRING",
            "retrieved_at": "UTC_DATETIME"
        }
    }]

def get_bearer(client_id, client_secret, user_agent):
    auth = requests.auth.HTTPBasicAuth(client_id, client_secret)
    data = {"grant_type": "client_credentials"}
    headers = {"User-Agent": user_agent}
    r = requests.post(TOKEN_URL, auth=auth, data=data, headers=headers, timeout=30)
    r.raise_for_status()
    tok = r.json()["access_token"]
    return {"Authorization": f"bearer {tok}", "User-Agent": user_agent}

def update(configuration: dict, state: dict):
    client_id     = configuration["client_id"]
    client_secret = configuration["client_secret"]
    user_agent    = configuration["user_agent"]
    brand_terms   = configuration.get("brand_terms", [])
    subreddits    = configuration.get("subreddits", [])  # optional filter
    lookback_days = int(configuration.get("lookback_days", 7))
    page_limit    = int(configuration.get("page_limit", 30))

    headers = get_bearer(client_id, client_secret, user_agent)

    now = datetime.now(timezone.utc)
    state = state or {}
    cursors = state.get("cursors", {})  # per term ISO

    log.info("connector start: Reddit posts")
    log.info("Initial state:" + repr(state))

    for term in brand_terms:
        since_iso = cursors.get(term)
        since_ts = datetime.fromisoformat(since_iso.replace("Z","+00:00")) if since_iso else now - timedelta(days=lookback_days)
        max_seen = since_ts

        params = {
            "q": f'"{term}"',
            "sort": "new",
            "limit": 100,
            "restrict_sr": "false"
        }
        if subreddits:
            params["restrict_sr"] = "true"
            # iterate subreddits if provided
            sr_list = subreddits
        else:
            sr_list = [None]

        for sr in sr_list:
            after = None
            pages = 0
            while pages < page_limit:
                if sr:
                    params["sr"] = sr
                if after:
                    params["after"] = after
                r = requests.get(SEARCH_URL, headers=headers, params=params, timeout=30)
                if r.status_code == 401:
                    headers = get_bearer(client_id, client_secret, user_agent)
                    r = requests.get(SEARCH_URL, headers=headers, params=params, timeout=30)
                r.raise_for_status()
                data = r.json()
                children = data.get("data", {}).get("children", [])
                if not children:
                    break

                for c in children:
                    d = c.get("data", {})
                    created = datetime.fromtimestamp(d.get("created_utc", 0), tz=timezone.utc)
                    # stop early if older than lookback window
                    if created < (now - timedelta(days=lookback_days)):
                        continue

                    record = {
                        "post_id": d.get("id"),
                        "brand": term,
                        "created_utc": created,
                        "subreddit": d.get("subreddit"),
                        "author": d.get("author"),
                        "title": d.get("title"),
                        "selftext": d.get("selftext"),
                        "score": d.get("score"),
                        "num_comments": d.get("num_comments"),
                        "url": d.get("url"),
                        "permalink": "https://reddit.com" + d.get("permalink",""),
                        "retrieved_at": now
                    }
                    op.upsert(table="reddit_posts", data=record)
                    if created > max_seen:
                        max_seen = created

                # checkpoint each page
                op.checkpoint(state=json.dumps({"cursors": {**cursors, term: max_seen.isoformat().replace("+00:00","Z")}}))

                after = data.get("data", {}).get("after")
                if not after:
                    break
                pages += 1

                # rate limit cushion
                time.sleep(0.3)  
                
        # final checkpoint per term
        cursors[term] = max_seen.isoformat().replace("+00:00","Z")
        op.checkpoint(state=json.dumps({"cursors": cursors}))

    log.info("connector complete")

connector = Connector(update=update, schema=schema)
