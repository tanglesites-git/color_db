from json import loads
from re import sub


def clean_data(color_list: list):
    with open("old_store1.json", "r", encoding="utf-8") as file:
        data = loads(file.read())

    for key, value in data.items():
        for item in value:
            v1: str = item[0]
            v1 = v1.strip()

            v2: str = item[1]
            v2 = v2.strip()

            if "#" in v1 and len(v1) == 7:
                item = [v1, v2]
            else:
                item = [v2, v1]

            # Clean Data
            hex = item[0]
            name = item[1]

            name = sub(r"\s+", " ", name).strip()

            if "/" in name:
                ll = name.split(" / ")

                if len(ll) == 1:
                    continue
                for i in ll:
                    color_list.append([hex, i.strip()])
            elif "," in name:
                kk = name.split(",")

                if len(kk) == 1:
                    continue
                for i in kk:
                    # print(i.strip())
                    color_list.append([hex, i.strip()])
            else:
                color_list.append([item[0], name])