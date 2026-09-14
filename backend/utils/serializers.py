"""Translate Mongo documents into API-shaped dicts.

Mongo stores an ObjectId under `_id`; JSON has no such type, so FastAPI
cannot serialise it. Every read path goes through here.
"""


def serialize_doc(doc: dict | None) -> dict | None:
    """Return a copy of `doc` with `_id` (ObjectId) replaced by `id` (str)."""
    if doc is None:
        return None
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    return out


def serialize_docs(docs) -> list[dict]:
    """Serialize an iterable of Mongo documents."""
    return [serialize_doc(d) for d in docs]
