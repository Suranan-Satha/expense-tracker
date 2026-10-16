#!/usr/bin/env bash
# ทดสอบ API แบบ end-to-end ด้วย curl (ใช้ฐานข้อมูลชั่วคราว)
set -u
export DB_FILE=$(mktemp -u /tmp/expense-test-XXXX.db)
export PORT=4100
cd "$(dirname "$0")"
node src/index.js > /tmp/expense-server.log 2>&1 &
PID=$!
sleep 1.5
B=http://localhost:$PORT/api/v1
pass=0; fail=0
check() { # check "ชื่อ" expected actual
  if [ "$2" = "$3" ]; then echo "PASS  $1"; pass=$((pass+1)); else echo "FAIL  $1 (expected $2, got $3)"; fail=$((fail+1)); fi
}
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
J='Content-Type: application/json'
TODAY=$(date +%F)
FUTURE=$(date -d '+3 days' +%F)

check "no token -> 401" 401 "$(code $B/expenses)"
check "register alice" 201 "$(code -X POST $B/auth/register -H "$J" -d '{"username":"alice","password":"secret1"}')"
check "register duplicate -> 409" 409 "$(code -X POST $B/auth/register -H "$J" -d '{"username":"alice","password":"secret1"}')"
check "register weak password -> 400" 400 "$(code -X POST $B/auth/register -H "$J" -d '{"username":"bob","password":"123"}')"
check "login wrong password -> 401" 401 "$(code -X POST $B/auth/login -H "$J" -d '{"username":"alice","password":"nope"}')"

TA=$(curl -s -X POST $B/auth/login -H "$J" -d '{"username":"alice","password":"secret1"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -s -X POST $B/auth/register -H "$J" -d '{"username":"bob","password":"secret2"}' > /dev/null
TB=$(curl -s -X POST $B/auth/login -H "$J" -d '{"username":"bob","password":"secret2"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
A="Authorization: Bearer $TA"; Bh="Authorization: Bearer $TB"

check "bad token -> 401" 401 "$(code $B/expenses -H 'Authorization: Bearer xxx')"

# Validation
check "amount = 0 -> 400" 400 "$(code -X POST $B/expenses -H "$A" -H "$J" -d "{\"amount\":0,\"category\":\"food\",\"date\":\"$TODAY\"}")"
check "amount text -> 400" 400 "$(code -X POST $B/expenses -H "$A" -H "$J" -d "{\"amount\":\"abc\",\"category\":\"food\",\"date\":\"$TODAY\"}")"
check "empty category -> 400" 400 "$(code -X POST $B/expenses -H "$A" -H "$J" -d "{\"amount\":10,\"category\":\"\",\"date\":\"$TODAY\"}")"
check "invalid category -> 400" 400 "$(code -X POST $B/expenses -H "$A" -H "$J" -d "{\"amount\":10,\"category\":\"xyz\",\"date\":\"$TODAY\"}")"
check "future date -> 400" 400 "$(code -X POST $B/expenses -H "$A" -H "$J" -d "{\"amount\":10,\"category\":\"food\",\"date\":\"$FUTURE\"}")"
LONG=$(node -pe '"x".repeat(251)')
check "note 251 chars -> 400" 400 "$(code -X POST $B/expenses -H "$A" -H "$J" -d "{\"amount\":10,\"category\":\"food\",\"date\":\"$TODAY\",\"note\":\"$LONG\"}")"

# Create
check "create valid -> 201" 201 "$(code -X POST $B/expenses -H "$A" -H "$J" -d "{\"amount\":65,\"category\":\"food\",\"date\":\"$TODAY\",\"note\":\"กาแฟ\"}")"
curl -s -X POST $B/expenses -H "$A" -H "$J" -d "{\"amount\":35.5,\"category\":\"transport\",\"date\":\"$TODAY\",\"note\":\"รถไฟฟ้า\"}" > /dev/null
curl -s -X POST $B/expenses -H "$A" -H "$J" -d '{"amount":120,"category":"food","date":"2020-01-15","note":"ข้าวมันไก่ 100%"}' > /dev/null

# Read + Search + Filter
R=$(curl -s $B/expenses -H "$A")
check "list count = 3" 3 "$(echo "$R" | node -pe 'JSON.parse(require("fs").readFileSync(0)).count')"
check "total = 220.5" 220.5 "$(echo "$R" | node -pe 'JSON.parse(require("fs").readFileSync(0)).total')"
check "search กาแฟ = 1" 1 "$(curl -s -G $B/expenses -H "$A" --data-urlencode 'search=กาแฟ' | node -pe 'JSON.parse(require("fs").readFileSync(0)).count')"
check "search '%' literal = 1" 1 "$(curl -s -G $B/expenses -H "$A" --data-urlencode 'search=%' | node -pe 'JSON.parse(require("fs").readFileSync(0)).count')"
check "filter category=food = 2" 2 "$(curl -s "$B/expenses?category=food" -H "$A" | node -pe 'JSON.parse(require("fs").readFileSync(0)).count')"
check "filter period=today = 2" 2 "$(curl -s "$B/expenses?period=today" -H "$A" | node -pe 'JSON.parse(require("fs").readFileSync(0)).count')"
check "category + search combined = 1" 1 "$(curl -s -G "$B/expenses" -H "$A" --data-urlencode 'category=food' --data-urlencode 'search=กาแฟ' | node -pe 'JSON.parse(require("fs").readFileSync(0)).count')"

# Isolation (bob must not see/modify alice's data)
ID=$(echo "$R" | node -pe 'JSON.parse(require("fs").readFileSync(0)).items[0].id')
check "bob list = 0" 0 "$(curl -s $B/expenses -H "$Bh" | node -pe 'JSON.parse(require("fs").readFileSync(0)).count')"
check "bob PUT alice's item -> 404" 404 "$(code -X PUT $B/expenses/$ID -H "$Bh" -H "$J" -d "{\"amount\":1,\"category\":\"food\",\"date\":\"$TODAY\"}")"
check "bob DELETE alice's item -> 404" 404 "$(code -X DELETE $B/expenses/$ID -H "$Bh")"

# Update + Delete
check "alice PUT -> 200" 200 "$(code -X PUT $B/expenses/$ID -H "$A" -H "$J" -d "{\"amount\":99,\"category\":\"bills\",\"date\":\"$TODAY\",\"note\":\"แก้แล้ว\"}")"
check "PUT updated value" 99 "$(curl -s "$B/expenses?category=bills" -H "$A" | node -pe 'JSON.parse(require("fs").readFileSync(0)).items[0].amount')"
check "alice DELETE -> 204" 204 "$(code -X DELETE $B/expenses/$ID -H "$A")"
check "after delete count = 2" 2 "$(curl -s $B/expenses -H "$A" | node -pe 'JSON.parse(require("fs").readFileSync(0)).count')"
check "DELETE again -> 404" 404 "$(code -X DELETE $B/expenses/$ID -H "$A")"

kill $PID 2>/dev/null
rm -f "$DB_FILE" "$DB_FILE-wal" "$DB_FILE-shm"
echo "---- passed: $pass, failed: $fail"
[ $fail -eq 0 ]
