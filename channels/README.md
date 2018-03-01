# Alert settings
Alert settings are stored in the files in channels/ and any of its one-step subfolders. Each file corresponds to a Discord channel and has title:
```
[channelID].[nice name].txt
```
`[channelID]` is an 18-digit number, `[nice name]` is ignored by the bot (but used for legibility). Each file consists of lines, with format:
```
[gym coords] # [filter] # [comments]
```
* `[gym coords]` is the gyms.json key format – `[lat],[lng]`, no spaces, 6 decimal places. e.g. `51.490000,-0.200000`.
* `[filter]` specifies either a lambda by its handle as stored in `gym.js`, or arbitrary code, via the syntax `~ [code]`, interpreted as JS `raid => [code]`. Current available handles:
    * `all`: accepts everything (at that gym);
    * `leg`: accepts 5* eggs only;
    * `ttar`: accepts Tyranitar bosses only;
    * `legttar`: accepts 5* eggs or Tyranitar bosses only.
* `[comments]` are ignored, but can be used for e.g. gym names, for legibility.