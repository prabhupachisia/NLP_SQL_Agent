import re
from collections import defaultdict

# In-memory schema storage
schema_store = {}


def normalize_text(text):
    """
    Lowercase and remove special characters for consistent matching.
    """
    text = text.lower()
    text = re.sub(r"[^a-z0-9_ ]+", " ", text)
    return text


def build_schema_index(connection_id, schema):
    """
    Build lightweight searchable schema index (no embeddings).
    """
    table_data = {}

    for table, info in schema.items():
        columns = [col["column"] for col in info["columns"]]

        primary_keys = info.get("primary_key", [])
        foreign_keys = info.get("foreign_keys", [])

        fk_descriptions = []
        for fk in foreign_keys:
            fk_descriptions.append(
                f"{fk['column']} references {fk['references_table']} {fk['references_column']}"
            )

        searchable_text = " ".join(
            [
                table,
                " ".join(columns),
                " ".join(primary_keys),
                " ".join(fk_descriptions),
            ]
        )

        table_data[table] = {
            "searchable_text": normalize_text(searchable_text),
            "columns": columns,
        }

    schema_store[connection_id] = table_data


def retrieve_relevant_tables(connection_id, user_prompt, top_k=3):
    """
    Retrieve relevant tables using keyword overlap scoring.
    """
    if connection_id not in schema_store:
        return []

    schema_data = schema_store[connection_id]
    prompt = normalize_text(user_prompt)
    prompt_words = set(prompt.split())

    scores = defaultdict(int)

    for table, data in schema_data.items():
        table_text = data["searchable_text"]

        for word in prompt_words:
            if word in table_text:
                scores[table] += 1

    # Sort tables by highest score
    ranked_tables = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    # Return top_k tables with score > 0
    relevant_tables = [table for table, score in ranked_tables if score > 0]

    return relevant_tables[:top_k]