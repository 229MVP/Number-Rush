extends Node
## Live run state + tile generation. Preserved gameplay rules for Number Rush.

signal run_started
signal run_updated
signal run_ended(won: bool)
signal score_changed(new_score: int)
signal combo_changed(multiplier: int)
signal strikes_changed(remaining: int)
signal tile_changed
signal lane_updated(lane_index: int)
signal perfect_cleared(lane_index: int, points: int)
signal busted(lane_index: int)
signal debug_reference_toggled(enabled: bool)

const TARGET_DEFAULT := 21
const MAX_STRIKES := 3
const LANE_COUNT := 4

enum Mode { CLASSIC, DAILY, RANKED }

var mode: Mode = Mode.CLASSIC
var target: int = TARGET_DEFAULT
var score: int = 0
var combo_streak: int = 0
var strikes_remaining: int = MAX_STRIKES
var lane_totals: Array[int] = [0, 0, 0, 0]
var current_tile: int = 1
var next_tile: int = 1
var input_locked: bool = false
var is_running: bool = false
var perfect_count: int = 0
var max_combo_multiplier: int = 1
var best_streak: int = 0
var debug_reference: bool = false

var _rng := RandomNumberGenerator.new()
var _daily_sequence: Array[int] = []
var _daily_index: int = 0


func _ready() -> void:
	_rng.randomize()


func get_combo_multiplier() -> int:
	if combo_streak <= 1:
		return 1
	if combo_streak <= 3:
		return 2
	if combo_streak <= 5:
		return 3
	return 4


func start_run(p_mode: Mode = Mode.CLASSIC, p_target: int = TARGET_DEFAULT) -> void:
	mode = p_mode
	target = p_target
	score = 0
	combo_streak = 0
	strikes_remaining = MAX_STRIKES
	lane_totals = [0, 0, 0, 0]
	perfect_count = 0
	max_combo_multiplier = 1
	best_streak = 0
	input_locked = false
	is_running = true
	debug_reference = false
	if mode == Mode.DAILY:
		_build_daily_sequence()
		_daily_index = 0
		current_tile = _pop_daily()
		next_tile = _pop_daily()
	else:
		current_tile = _roll_tile()
		next_tile = _roll_tile()
	run_started.emit()
	run_updated.emit()
	tile_changed.emit()
	score_changed.emit(score)
	combo_changed.emit(get_combo_multiplier())
	strikes_changed.emit(strikes_remaining)


func apply_debug_reference_state() -> void:
	## F8 visual-reference only. Does not save or affect production scoring.
	if OS.is_debug_build() == false and not OS.has_feature("editor"):
		return
	debug_reference = true
	score = 12450
	combo_streak = 3
	strikes_remaining = 2
	lane_totals = [14, 8, 21, 5]
	current_tile = 7
	next_tile = 4
	is_running = true
	input_locked = true
	run_updated.emit()
	tile_changed.emit()
	score_changed.emit(score)
	combo_changed.emit(get_combo_multiplier())
	strikes_changed.emit(strikes_remaining)
	debug_reference_toggled.emit(true)


func clear_debug_reference() -> void:
	if not debug_reference:
		return
	debug_reference = false
	input_locked = false
	debug_reference_toggled.emit(false)
	start_run(mode, target)


var last_points_awarded: int = 0


func place_tile(lane_index: int) -> String:
	## Returns "perfect" | "bust" | "normal" | "blocked"
	last_points_awarded = 0
	if not is_running or input_locked or debug_reference:
		return "blocked"
	if lane_index < 0 or lane_index >= LANE_COUNT:
		return "blocked"
	var new_total: int = lane_totals[lane_index] + current_tile
	lane_totals[lane_index] = new_total
	lane_updated.emit(lane_index)
	var result := "normal"
	if new_total == target:
		result = "perfect"
		var mult: int = get_combo_multiplier()
		var points: int = 100 * mult
		last_points_awarded = points
		score += points
		combo_streak += 1
		perfect_count += 1
		max_combo_multiplier = maxi(max_combo_multiplier, get_combo_multiplier())
		best_streak = maxi(best_streak, combo_streak)
		score_changed.emit(score)
		combo_changed.emit(get_combo_multiplier())
		perfect_cleared.emit(lane_index, points)
	elif new_total > target:
		result = "bust"
		combo_streak = 0
		strikes_remaining = maxi(0, strikes_remaining - 1)
		combo_changed.emit(get_combo_multiplier())
		strikes_changed.emit(strikes_remaining)
		busted.emit(lane_index)
	# Advance tiles
	_advance_tiles()
	run_updated.emit()
	if result == "bust" and strikes_remaining <= 0:
		end_run(false)
	return result


func set_lane_total(lane_index: int, total: int) -> void:
	if lane_index < 0 or lane_index >= LANE_COUNT:
		return
	lane_totals[lane_index] = total
	lane_updated.emit(lane_index)


func set_tiles(current: int, next: int) -> void:
	current_tile = current
	next_tile = next
	tile_changed.emit()


func reset_lane(lane_index: int) -> void:
	if lane_index < 0 or lane_index >= LANE_COUNT:
		return
	lane_totals[lane_index] = 0
	lane_updated.emit(lane_index)
	run_updated.emit()


func use_swap() -> bool:
	if debug_reference or not is_running:
		return false
	if not SaveService.consume_item("swap", 1):
		return false
	var tmp: int = current_tile
	current_tile = next_tile
	next_tile = tmp
	tile_changed.emit()
	return true


func use_multiplier_armed() -> bool:
	return SaveService.inventory.get("multiplier", 0) > 0


func end_run(won: bool) -> void:
	if not is_running:
		return
	is_running = false
	input_locked = true
	if not debug_reference:
		SaveService.record_run(score, max_combo_multiplier, won)
		if won:
			var coin_reward: int = 100 + score / 50
			var gem_reward: int = 5 + perfect_count / 3
			SaveService.add_coins(coin_reward)
			SaveService.add_gems(gem_reward)
			SaveService.xp += 120
			SaveService.save()
	run_ended.emit(won)


func get_run_summary() -> Dictionary:
	return {
		"score": score,
		"max_combo": max_combo_multiplier,
		"perfect_tiles": perfect_count,
		"best_streak": best_streak,
		"strikes_used": MAX_STRIKES - strikes_remaining,
		"is_best": score >= SaveService.high_score,
		"high_score": maxi(SaveService.high_score, score),
		"coins": 100 + score / 50,
		"gems": 5 + perfect_count / 3,
		"xp": 120,
	}


func _advance_tiles() -> void:
	current_tile = next_tile
	if mode == Mode.DAILY:
		next_tile = _pop_daily()
	else:
		next_tile = _roll_tile()
	tile_changed.emit()


func _roll_tile() -> int:
	return _rng.randi_range(1, 10)


func _build_daily_sequence() -> void:
	var day_key := Time.get_date_string_from_system()
	var seed_val := 0
	for i in day_key.length():
		seed_val = (seed_val * 31 + day_key.unicode_at(i)) % 2147483647
	var local := RandomNumberGenerator.new()
	local.seed = seed_val
	_daily_sequence.clear()
	for i in 256:
		_daily_sequence.append(local.randi_range(1, 10))
	_daily_index = 0


func _pop_daily() -> int:
	if _daily_sequence.is_empty():
		_build_daily_sequence()
	var v: int = _daily_sequence[_daily_index % _daily_sequence.size()]
	_daily_index += 1
	return v
