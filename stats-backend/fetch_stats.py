"""Daily stats -> stats.json.  Needs a service account JSON in GitHub secret GCP_SA_KEY.
 - Installs/rating: Play Console bulk reports in GCS (bucket id: Play Console > Download reports > Statistics).
 - Active users / events: Firebase Analytics BigQuery export (set BQ_DATASET, e.g. myproj.analytics_123456).
Every part is optional; a missing env var just skips that metric. Review before enabling: untested against live data."""
import os, json, csv, io, datetime
out = {"updated": datetime.datetime.utcnow().isoformat() + "Z", "games": {"moonrope": {}, "feltflight": {}, "voidbrawl": {}}}
PKG = {"moonrope": "com.duskmoonstudio.tether", "feltflight": "com.duskmoonstudio.feltflight", "voidbrawl": "com.duskmoonstudio.arena"}
bucket = os.getenv("PLAY_GCS_BUCKET")
if bucket:
    from google.cloud import storage
    cl = storage.Client(); month = datetime.date.today().strftime("%Y%m")
    for g, pkg in PKG.items():
        try:
            b = cl.bucket(bucket).blob(f"stats/installs/installs_{pkg}_{month}_overview.csv")
            rows = list(csv.DictReader(io.StringIO(b.download_as_bytes().decode("utf-16"))))
            out["games"][g]["installs"] = int(rows[-1]["Total User Installs"])
        except Exception as e: print("installs skipped", g, e)
        try:
            b = cl.bucket(bucket).blob(f"stats/ratings/ratings_{pkg}_{month}_overview.csv")
            rows = list(csv.DictReader(io.StringIO(b.download_as_bytes().decode("utf-16"))))
            out["games"][g]["rating"] = round(float(rows[-1]["Total Average Rating"]), 1)
        except Exception as e: print("rating skipped", g, e)
ds = os.getenv("BQ_DATASET")
if ds:
    from google.cloud import bigquery
    bq = bigquery.Client()
    q = f"SELECT app_info.id AS pkg, COUNT(*) n FROM `{ds}.events_*` WHERE event_name='session_start' GROUP BY pkg"
    try:
        for r in bq.query(q):
            for g, pkg in PKG.items():
                if r.pkg == pkg: out["games"][g]["runs"] = int(r.n)
    except Exception as e: print("bq skipped", e)
json.dump(out, open("stats.json", "w"), indent=1)
