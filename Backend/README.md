<!-- 
//Ex-1
const [matchingRoom, found] = Object.entries(connections)
  .reduce(([room, isFound], [roomKey, roomValue]) => {
    if (!isFound && roomValue.includes(socket.id)) {
      return [roomKey, true];
    }
    return [room, isFound];
  }, ['', false]);
```

---

## 🎯 Goal

This code is used to find **which room a specific socket (user) is connected to**, based on their `socket.id`.

You're looping through a `connections` object that looks like this:

### 🔧 Example: `connections` object

```js
const connections = {
  "/room1": ["socket123", "socket456"],
  "/room2": ["socket789"],
  "/room3": ["socket999", "socketABC"]
};
```

Let's say the `socket.id` is `"socket789"`.

---

## 🧠 Step-by-Step Breakdown

### 1. `Object.entries(connections)`

This converts the object into an array of `[key, value]` pairs:

```js
[
  ["/room1", ["socket123", "socket456"]],
  ["/room2", ["socket789"]],
  ["/room3", ["socket999", "socketABC"]]
]
```

### 2. `.reduce(...)`

We're using `.reduce()` to iterate through the list and **find the first room that includes our socket ID**.

The initial value is `['', false]`:

* `''` → means no room has been found yet.
* `false` → means we haven't found the room yet.

### 3. Destructuring the `.reduce()` inputs:

#### Inside the reducer:

```js
([room, isFound], [roomKey, roomValue])
```

* `room`: current best match (so far)
* `isFound`: whether a match has been found
* `roomKey`: the room being checked in the current loop (`"/room1"`, etc.)
* `roomValue`: array of socket IDs in that room

---

## 🔁 Iteration Simulation

Assume `socket.id = "socket789"`.

We loop through:

### ✅ 1st iteration:

* `roomKey = "/room1"`
* `roomValue = ["socket123", "socket456"]`
* `isFound = false`
* `roomValue.includes(socket.id)` → `false`
  → return `['', false]` (no change)

---

### ✅ 2nd iteration:

* `roomKey = "/room2"`
* `roomValue = ["socket789"]`
* `roomValue.includes(socket.id)` → `true`
  → return `["/room2", true]` ← found it!

---

### ✅ 3rd iteration:

Even though we continue the loop, `isFound = true`, so this block is skipped:

```js
if (!isFound && roomValue.includes(socket.id)) { ... }
```

→ just return what we already have: `["/room2", true]`

---

### 🧾 Final Result:

```js
matchingRoom = "/room2"
found = true
```

So now you know the user is in `"/room2"`.

---

## ✅ What You Can Do with This

You can now:

* Store messages in the correct room.
* Send a message to all other sockets in the same room.
* Handle disconnections and room-leaving.

---

## 🧠 Summary Table

| Concept                         | Explanation                                      |
| ------------------------------- | ------------------------------------------------ |
| `Object.entries()`              | Converts object to array of `[key, value]` pairs |
| `.reduce()`                     | Finds the room where `socket.id` is present      |
| `roomValue.includes(socket.id)` | Checks if socket is in that room                 |
| `['', false]`                   | Initial accumulator: no room found yet           |
--> -->
