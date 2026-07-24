import json

with open("country_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print([d["names"]["common"] for d in data])

# print(data[0].keys())
# print()
# print(data[0]["memberships"].keys())
# print()

# filtered = set()
# mems = ["g20", "eu", "oecd", "nato"]

# for country in data:
#     for mem in mems:
#         if country["memberships"][mem] == True:
#             filtered.add(country["names"]["common"])

# print(filtered)
# print(len(filtered))