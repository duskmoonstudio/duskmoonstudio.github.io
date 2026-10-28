# Live counters from the apps (optional, small app update)
Create documents `stats/moonrope`, `stats/feltflight`, `stats/voidbrawl` once by hand in the Firestore console
(fields as integers: runs, flights, badges, matches, topRing, online = 0).

Unity (Firebase Firestore SDK), call once per event, only when the player has analytics on:
```csharp
// after a Moonrope run ends
FirebaseFirestore.DefaultInstance.Collection("stats").Document("moonrope")
  .UpdateAsync(new Dictionary<string, object>{{"runs", FieldValue.Increment(1)}});
// new best ring globally is better done with a transaction: topRing = max(topRing, ring)
```
Respect the in-game "Privacy → statistics" switch: skip the call when it is off.
Update the Play Data safety form if you start sending new data (counters are anonymous, no ID attached).
Then put your Firebase project id in `assets/stats-config.js`.
