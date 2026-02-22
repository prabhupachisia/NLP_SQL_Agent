import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def build_prompt(schema, user_prompt):
    schema_text = ""
    for table, columns in schema.items():
        cols = ", ".join([f"{col['column']} ({col['type']})" for col in columns])
        schema_text += f"Table: {table}\nColumns: {cols}\n\n"

    return f"""You are an expert SQL query generator.
You will be given a database schema and a user request in plain English.
Your job is to convert the user request into a valid MySQL query.

Rules:
- Return ONLY the SQL query, no explanation, no markdown, no backticks
- Use only the tables and columns provided in the schema
- Do not make up table or column names

Database Schema:
{schema_text}

User Request: {user_prompt}

SQL Query:"""

def generate_sql(schema, user_prompt):
    try:
        prompt = build_prompt(schema, user_prompt)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        sql = response.choices[0].message.content.strip()
        return {"success": True, "sql": sql}

    except Exception as e:
        return {"success": False, "error": str(e)}