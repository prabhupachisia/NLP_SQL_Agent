import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load embedding model once
model = SentenceTransformer("all-MiniLM-L6-v2")

# In-memory storage
schema_index_store = {}


def build_schema_embeddings(connection_id, schema):
    texts = []
    table_map = []

    for table, info in schema.items():

        column_text = ", ".join(
            [col["column"] for col in info["columns"]]
        )

        pk_text = ", ".join(info["primary_key"]) if info["primary_key"] else "None"

        fk_text_parts = []
        for fk in info["foreign_keys"]:
            fk_text_parts.append(
                f"{fk['column']} references {fk['references_table']}.{fk['references_column']}"
            )

        fk_text = "; ".join(fk_text_parts) if fk_text_parts else "None"

        text = (
            f"Table {table}. "
            f"Primary key: {pk_text}. "
            f"Foreign keys: {fk_text}. "
            f"Columns: {column_text}."
        )

        texts.append(text)
        table_map.append(table)

    embeddings = model.encode(texts)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings))

    schema_index_store[connection_id] = {
        "index": index,
        "table_map": table_map,
        "texts": texts
    }


def retrieve_relevant_tables(connection_id, user_prompt, top_k=3):
    """
    Retrieve most relevant tables using vector similarity.
    """
    if connection_id not in schema_index_store:
        return []

    data = schema_index_store[connection_id]
    index = data["index"]
    table_map = data["table_map"]

    query_embedding = model.encode([user_prompt])
    distances, indices = index.search(np.array(query_embedding), top_k)

    relevant_tables = [table_map[i] for i in indices[0]]

    return relevant_tables