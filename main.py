import re
import json

color_list = []
color_index = {}

new_list = []

def merge_color_dbs():
    with open('colors_db.json', 'r', encoding="utf-8") as file:
        data = json.loads(file.read())
        data1 = None
        for item in data:
            name = item['name']
            hex = item['hex']
            new_list.append([hex, name])

        with open('old_store.json', 'r', encoding="utf-8") as file:
            data1 = json.loads(file.read())

            data1['db'] = new_list

        with open('old_store.json', 'w', encoding='utf-8') as file:
            file.write(json.dumps(data1, indent=2))

def clean_data():
    with open('old_store1.json', 'r', encoding="utf-8") as file:
        data = json.loads(file.read())

    for key, value in data.items():
        
        for item in value:
            v1: str = item[0]
            v1 = v1.strip()

            v2: str = item[1]
            v2 = v2.strip()

            if '#' in v1 and len(v1) == 7:
                item = [v1, v2]
            else:
                item = [v2, v1]

            # Clean Data
            hex = item[0]
            name = item[1]

            name = re.sub(r'\s+', ' ', name).strip()

            if '/' in name:
                ll = name.split(' / ')
                
                if len(ll) == 1:
                    continue
                for i in ll:
                    color_list.append([hex, i.strip()])
            elif ',' in name:
                kk = name.split(',')
                
                if len(kk) == 1:
                    continue
                for i in kk:
                    # print(i.strip())
                    color_list.append([hex, i.strip()])
            else:
                color_list.append([item[0], name])


def create_indexed_json():
    with open('store.json', 'r', encoding='utf-8') as file:
        data = json.loads(file.read())

        for item in data:
            hex = item[0]
            value = item[1].upper()

            if hex not in color_index:
                color_index[hex] = [value]
            else:
                if value in color_index[hex]:
                    continue
                else:
                    color_index[hex].append(value)


def main():
    merge_color_dbs()
    clean_data()
    with open('store.json', 'w', encoding="utf-8") as file:
        file.write(json.dumps(color_list, indent=2))


    create_indexed_json()
    with open('color_index.json', 'w', encoding='utf-8') as file:
        file.write(json.dumps(color_index, indent=2))

    print(f'Color List: {len(color_list)}')
    print(f"Color Index: {len(color_index)}")

if __name__ == '__main__':
    main()