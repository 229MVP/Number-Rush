extends Node
## Persistent player save: high score, currencies, inventory, settings, tutorial.

const SAVE_PATH := "user://number_rush_save.json"

signal changed

var coins: int = 500
var gems: int = 50
var high_score: int = 0
var games_played: int = 0
var total_wins: int = 0
var best_streak: int = 0
var xp: int = 0
var level: int = 1
var username: String = "Player"
var rank_title: String = "Rookie"
var season_points: int = 0

var tutorial_completed: bool = false
var music_enabled: bool = true
var sfx_enabled: bool = true
var haptics_enabled: bool = false
var notifications_enabled: bool = true

var inventory: Dictionary = {
	"multiplier": 2,
	"bomb": 1,
	"freeze": 1,
	"shield": 1,
	"wild": 0,
	"swap": 3,
}


func _ready() -> void:
	load_save()


func load_save() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if f == null:
		return
	var data: Variant = JSON.parse_string(f.get_as_text())
	f.close()
	if typeof(data) != TYPE_DICTIONARY:
		return
	var d: Dictionary = data
	coins = int(d.get("coins", coins))
	gems = int(d.get("gems", gems))
	high_score = int(d.get("high_score", high_score))
	games_played = int(d.get("games_played", games_played))
	total_wins = int(d.get("total_wins", total_wins))
	best_streak = int(d.get("best_streak", best_streak))
	xp = int(d.get("xp", xp))
	level = int(d.get("level", level))
	username = str(d.get("username", username))
	rank_title = str(d.get("rank_title", rank_title))
	season_points = int(d.get("season_points", season_points))
	tutorial_completed = bool(d.get("tutorial_completed", tutorial_completed))
	music_enabled = bool(d.get("music_enabled", music_enabled))
	sfx_enabled = bool(d.get("sfx_enabled", sfx_enabled))
	haptics_enabled = bool(d.get("haptics_enabled", haptics_enabled))
	notifications_enabled = bool(d.get("notifications_enabled", notifications_enabled))
	if d.has("inventory") and typeof(d["inventory"]) == TYPE_DICTIONARY:
		for k in d["inventory"].keys():
			inventory[str(k)] = int(d["inventory"][k])
	changed.emit()


func save() -> void:
	var data := {
		"coins": coins,
		"gems": gems,
		"high_score": high_score,
		"games_played": games_played,
		"total_wins": total_wins,
		"best_streak": best_streak,
		"xp": xp,
		"level": level,
		"username": username,
		"rank_title": rank_title,
		"season_points": season_points,
		"tutorial_completed": tutorial_completed,
		"music_enabled": music_enabled,
		"sfx_enabled": sfx_enabled,
		"haptics_enabled": haptics_enabled,
		"notifications_enabled": notifications_enabled,
		"inventory": inventory.duplicate(),
	}
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f == null:
		push_warning("Failed to write save")
		return
	f.store_string(JSON.stringify(data))
	f.close()
	changed.emit()


func add_coins(amount: int) -> void:
	coins = maxi(0, coins + amount)
	save()


func add_gems(amount: int) -> void:
	gems = maxi(0, gems + amount)
	save()


func consume_item(key: String, amount: int = 1) -> bool:
	var have: int = int(inventory.get(key, 0))
	if have < amount:
		return false
	inventory[key] = have - amount
	save()
	return true


func grant_item(key: String, amount: int = 1) -> void:
	inventory[key] = int(inventory.get(key, 0)) + amount
	save()


func record_run(score: int, max_combo: int, won: bool) -> void:
	games_played += 1
	if won:
		total_wins += 1
	if score > high_score:
		high_score = score
	if max_combo > best_streak:
		best_streak = max_combo
	xp += 20 + score / 100
	while xp >= level * 500:
		xp -= level * 500
		level += 1
	save()


func complete_tutorial() -> void:
	tutorial_completed = true
	save()
