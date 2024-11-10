from json import loads
import sqlite3
from time import perf_counter_ns

from colors import from_hex_to_rgb, from_hex_to_rgb_linear
from common import DATA, COLOR_SQL
from common.file_paths import FINAL_FILE


def create_database():
    conn = sqlite3.connect("colors.db", autocommit=True)
    cursor = conn.cursor()

    table_sql = """
DROP TABLE IF EXISTS colors;
CREATE TABLE IF NOT EXISTS colors (
    id integer not null ,
    name TEXT NOT NULL ,
    hex TEXT NOT NULL ,
    rgb TEXT NOT NULL ,
    rgbl TEXT NOT NULL ,
    PRIMARY KEY (id)
);
CREATE INDEX if not exists color_name_idx on colors (name);
CREATE INDEX if not exists color_value_idx on colors (hex);
CREATE INDEX if not exists color_rgb_idx on colors (rgb);
CREATE INDEX if not exists color_rgbl_idx on colors (rgbl);

INSERT INTO colors (name, hex, rgb, rgbl) VALUES
"""
    i = 0
    with open(DATA / FINAL_FILE, "r", encoding="utf-8") as file:
        data = loads(file.read())
        size = len(data)

        for key, color_list in data.items():
            rgb = from_hex_to_rgb(key)
            rgbl = from_hex_to_rgb_linear(key)
            if i == size - 1:
                for index, color_name in enumerate(color_list):
                    if index == len(color_list) - 1:
                        table_sql += (
                            f'     ("{color_name}", "{key}", "rgb{rgb}", "rgb{rgbl}");'
                        )
                    else:
                        table_sql += (
                            f'("{color_name}", "{key}", "rgb{rgb}", "rgb{rgbl}"),\n'
                        )
            else:
                for index, color_name in enumerate(color_list):
                    table_sql += (
                        f'     ("{color_name}", "{key}", "rgb{rgb}", "rgb{rgbl}"),\n'
                    )
            i = i + 1

    table_sql.strip()
    with open(DATA / COLOR_SQL, "w", encoding="utf-8") as file:
        file.write(table_sql)

    script_list = table_sql.split(";")
    script_list.pop(-1)

    for script in script_list:
        script += ";"
        print(script)
        s1 = perf_counter_ns()
        cursor.execute(script)
        s2 = perf_counter_ns()
        print(f"Time: {(s2 - s1) / 1_000_000}ms")
