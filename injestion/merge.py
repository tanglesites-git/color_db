from json import loads, dumps

from common import DATA, OLD_STORE, COLOR_DB


def merge_color_dbs(new_list: list):
    with open(DATA / COLOR_DB, "r", encoding="utf-8") as file:
        data = loads(file.read())
        data1 = None
        for item in data:
            name = item["name"]
            hex = item["hex"]
            new_list.append([hex, name])

        with open(DATA / OLD_STORE, "r", encoding="utf-8") as file:
            data1 = loads(file.read())

            data1["db"] = new_list

        with open(DATA / OLD_STORE, "w", encoding="utf-8") as file:
            file.write(dumps(data1, indent=2))
