import json, re, sys, pathlib, subprocess
import os
ROOT = pathlib.Path("/home/claude/mscomp")
rows = json.loads(subprocess.check_output(["node", "-e", open(ROOT/"data.js").read() + "\nconsole.log(JSON.stringify(SO_ROWS))"]))
ROW = {r[0]: r for r in rows}
LV = {"B": "Basic", "I": "Intermediate", "C": "Challenge"}
lc = lambda s: s[0].lower() + s[1:]

def split(s, sep): return [x.strip() for x in s.split(sep)]

def parse_file(path):
    out, cur, errs = {}, None, []
    for n, line in enumerate(path.read_text().split("\n"), 1):
        line = line.rstrip()
        if not line.strip() or line.startswith("#"): continue
        if line.startswith("=== "):
            code, i = line[4:].split(); i = int(i)
            cur = {"code": code, "i": i, "v": [], "ex": [], "p": [], "mc": [], "sa": [], "_line": n}
            out[(code, i)] = cur; continue
        k, _, val = line.partition(": ")
        k = k.strip(); val = val.strip()
        if cur is None: errs.append(f"{path.name}:{n} outside lesson"); continue
        try:
            if k in ("hook", "src", "pr"): cur[k] = val
            elif k == "tx": cur["tx"] = val.replace(" ¶ ", "\n").replace("¶", "\n")
            elif k in ("sc", "st", "org", "an", "mis", "et"): cur[k] = split(val, " | ")
            elif k == "ts": t, ty, q = split(val, " || "); cur["ts"] = (t, ty, q)
            elif k == "v": t, d = split(val, " :: "); cur["v"].append({"term": t, "definition": d})
            elif k == "ex":
                t, p, st, a, e = split(val, " || "); cur["ex"].append({"title": t, "problem": p, "steps": split(st, " | "), "answer": a, "explore": e})
            elif k == "p": l, q, a = split(val, " || "); cur["p"].append({"q": q, "a": a, "level": LV[l]})
            elif k == "mc":
                l, q, opts, ans = split(val, " || "); o = split(opts, " | ")
                if len(o) != 4: raise ValueError("mc needs 4 options")
                labs = [f"{'ABCD'[j]}) {x}" for j, x in enumerate(o)]
                cur["mc"].append({"type": "mc", "q": q, "options": labs, "answer": labs["ABCD".index(ans)], "level": LV[l]})
            elif k == "sa": l, q, a = split(val, " || "); cur["sa"].append({"type": "short", "q": q, "answer": a, "level": LV[l]})
            else: errs.append(f"{path.name}:{n} unknown key {k!r}")
        except Exception as e:
            errs.append(f"{path.name}:{n} {k}: {e}")
    return out, errs

def build(L):
    code, i = L["code"], L["i"]; r = ROW[code]; title = r[3][i]
    lv = [p["level"] for p in L["p"]]
    errs = []
    need = ["hook", "sc", "ts", "tx", "src", "st", "org", "an", "pr", "mis", "et"]
    for k in need:
        if k not in L: errs.append(f"missing {k}")
    if len(L["ex"]) != 4: errs.append(f"{len(L['ex'])} examples")
    if len(L["p"]) != 15 or lv.count("Basic") != 5 or lv.count("Intermediate") != 6 or lv.count("Challenge") != 4: errs.append(f"practice {len(L['p'])} B{lv.count('Basic')} I{lv.count('Intermediate')} C{lv.count('Challenge')}")
    if len(L["mc"]) != 12 or len(L["sa"]) != 8: errs.append(f"test mc{len(L['mc'])} sa{len(L['sa'])}")
    if not 4 <= len(L["v"]) <= 8: errs.append(f"{len(L['v'])} vocab")
    for it in L["p"] + L["mc"] + L["sa"]:
        for f in ("q", "a", "answer"):
            if " | " in str(it.get(f, "")): errs.append("stray | in " + str(it.get(f))[:60])
    if errs: return None, errs
    t, ty, q = L["ts"]
    rec = {"kind": "lesson", "key": f"{code}_{i}", "code": code, "i": i, "builtin": True,
        "body": {"objective": f"Students will be able to {lc(title)}.", "iCan": f"I can {lc(title)}.", "successCriteria": L["sc"], "hook": L["hook"],
            "vocabulary": L["v"], "study": {"title": t, "type": ty, "question": q, "passage": L["tx"], "source": L["src"], "steps": L["st"], "organizer": L["org"], "discussion": L["an"], "product": L["pr"]},
            "examples": L["ex"], "practice": L["p"], "misconceptions": L["mis"], "exitTicket": L["et"]},
        "test": {"title": f"Practice test: {title}", "items": L["mc"] + L["sa"]}}
    return rec, []

if __name__ == "__main__":
    allL, errs = {}, []
    for f in sorted((ROOT/"src").glob("*.txt")):
        o, e = parse_file(f); allL.update(o); errs += e
    by = {}
    for (code, i), L in sorted(allL.items()):
        if code not in ROW: errs.append(f"unknown code {code}"); continue
        rec, e = build(L)
        if e: errs.append(f"{code} lesson {i}: " + "; ".join(e)); continue
        by.setdefault(code, []).append(rec)
    out = ROOT/"lessons"; out.mkdir(exist_ok=True)
    done = []
    for code, ls in by.items():
        if len(ls) >= 1:  # elementary: built-in lessons can cover only some lessons of an outcome
            (out/f"{code}.json").write_text(json.dumps({"code": code, "lessons": sorted(ls, key=lambda x: x["i"])}, ensure_ascii=False, separators=(",", ":")))
            done.append(code)
        else:
            errs.append(f"{code}: {len(ls)}/{len(ROW[code][3])} lessons valid")
    order = [r[0] for r in rows]
    (out/"index.json").write_text(json.dumps(sorted(done, key=order.index)))
    print(f"{len(done)}/{len(rows)} outcomes complete")
    for e in errs: print("ERR", e)
    missing = [c for c in order if c not in done]
    print("missing:", " ".join(missing))
