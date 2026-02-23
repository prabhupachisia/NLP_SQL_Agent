import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# 🔹 Map DB types to dialect names
DIALECT_MAP = {
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "sqlite": "SQLite",
    "mssql": "Microsoft SQL Server"
}


def clean_llm_output(output: str) -> str:
    """
    Remove markdown, backticks, explanations.
    """
    output = output.strip()

    # Remove markdown code blocks
    output = re.sub(r"```sql|```", "", output, flags=re.IGNORECASE)

    # Remove leading explanations like "Here is your query:"
    output = re.sub(r"^.*?(SELECT|INSERT|UPDATE|DELETE)", r"\1", output, flags=re.IGNORECASE | re.DOTALL)

    return output.strip()


def build_prompt(schema, user_prompt, db_type):
    dialect = DIALECT_MAP.get(db_type, "SQL")

    schema_text = ""

    for table, info in schema.items():

        columns_text = "\n".join(
            [f"  - {col['column']} ({col['type']})"
             for col in info["columns"]]
        )

        pk_text = ", ".join(info["primary_key"]) if info["primary_key"] else "None"

        fk_lines = ""
        if info["foreign_keys"]:
            for fk in info["foreign_keys"]:
                fk_lines += (
                    f"  - {fk['column']} → "
                    f"{fk['references_table']}.{fk['references_column']}\n"
                )
        else:
            fk_lines = "  - None\n"

        schema_text += f"""
Table: {table}
Primary Key: {pk_text}
Foreign Keys:
{fk_lines}
Columns:
{columns_text}

"""

    return f"""
You are an expert {dialect} SQL generator.

Rules:
- Return ONLY valid SQL.
- No explanations.
- Use only the provided schema.
- Use foreign key relationships when constructing JOIN queries.
- Do not invent tables or columns.
- Do not generate destructive queries.

Database Schema:
{schema_text}

User Request:
{user_prompt}

SQL Query:
"""


def generate_sql(schema, user_prompt, db_type):
    try:
        prompt = build_prompt(schema, user_prompt, db_type)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a highly accurate SQL generation engine."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,
            max_tokens=1024
        )

        raw_sql = response.choices[0].message.content
        sql = clean_llm_output(raw_sql)

        # 🚨 Extra safety: block semicolon chaining
        if ";" in sql[:-1]:
            return {
                "success": False,
                "error": "Multiple SQL statements detected."
            }

        return {"success": True, "sql": sql}

    except Exception as e:
        return {"success": False, "error": str(e)}
    

def correct_sql(schema, user_prompt, previous_sql, error_message, db_type):
    try:
        dialect = DIALECT_MAP.get(db_type, "SQL")

        correction_prompt = f"""
You previously generated this {dialect} SQL:

{previous_sql}

It failed with this error:

{error_message}

Fix the query.
Follow these rules:
- Return ONLY corrected SQL
- No explanations
- No markdown
- Use only provided schema
- Do NOT generate destructive queries

User request:
{user_prompt}
"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a SQL error correction engine."},
                {"role": "user", "content": correction_prompt}
            ],
            temperature=0
        )

        corrected_sql = clean_llm_output(
            response.choices[0].message.content
        )

        return {"success": True, "sql": corrected_sql}

    except Exception as e:
        return {"success": False, "error": str(e)}