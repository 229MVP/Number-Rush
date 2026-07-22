extends SceneTree
## Headless smoke test: instantiate every screen script once.


func _init() -> void:
	call_deferred("_run")


func _run() -> void:
	var gs: Node = root.get_node("GameState")
	var paths := [
		"res://ui/screens/splash_screen.gd",
		"res://ui/screens/main_menu_screen.gd",
		"res://ui/screens/gameplay_screen.gd",
		"res://ui/screens/powerups_screen.gd",
		"res://ui/screens/tournament_screen.gd",
		"res://ui/screens/ranked_screen.gd",
		"res://ui/screens/victory_screen.gd",
		"res://ui/screens/game_over_screen.gd",
		"res://ui/screens/profile_screen.gd",
		"res://ui/screens/shop_screen.gd",
		"res://ui/screens/missions_screen.gd",
		"res://ui/screens/leaderboard_screen.gd",
		"res://ui/screens/settings_screen.gd",
	]
	var host := Control.new()
	host.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	host.custom_minimum_size = Vector2(390, 844)
	root.add_child(host)
	await process_frame
	gs.call("start_run", 0, 21)
	for p in paths:
		var script: GDScript = load(p) as GDScript
		var screen: Node = script.new()
		host.add_child(screen)
		if screen.has_method("on_enter"):
			screen.call("on_enter", {})
		await process_frame
		print("OK ", p)
		if screen.has_method("on_exit"):
			screen.call("on_exit")
		screen.queue_free()
		await process_frame
	gs.call("start_run", 0, 21)
	gs.call("set_tiles", 21, 4)
	gs.call("set_lane_total", 0, 0)
	var r1: String = str(gs.call("place_tile", 0))
	print("perfect_test=", r1, " score=", gs.get("score"))
	gs.call("start_run", 0, 21)
	gs.call("set_tiles", 10, 4)
	gs.call("set_lane_total", 0, 12)
	var r2: String = str(gs.call("place_tile", 0))
	print("bust_test=", r2, " strikes=", gs.get("strikes_remaining"))
	gs.call("start_run", 0, 21)
	gs.call("set_tiles", 3, 4)
	gs.call("set_lane_total", 0, 5)
	var score_before: int = int(gs.get("score"))
	var r3: String = str(gs.call("place_tile", 0))
	print("normal_test=", r3, " score_delta=", int(gs.get("score")) - score_before)
	print("SMOKE_DONE")
	quit()
