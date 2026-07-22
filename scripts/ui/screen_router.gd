class_name ScreenRouter
extends Control
## Central fade router (~110ms) for Number Rush screens.

const SCREEN_PATHS := {
	"splash": "res://ui/screens/splash_screen.gd",
	"menu": "res://ui/screens/main_menu_screen.gd",
	"gameplay": "res://ui/screens/gameplay_screen.gd",
	"powerups": "res://ui/screens/powerups_screen.gd",
	"tournament": "res://ui/screens/tournament_screen.gd",
	"ranked": "res://ui/screens/ranked_screen.gd",
	"victory": "res://ui/screens/victory_screen.gd",
	"gameover": "res://ui/screens/game_over_screen.gd",
	"profile": "res://ui/screens/profile_screen.gd",
	"shop": "res://ui/screens/shop_screen.gd",
	"missions": "res://ui/screens/missions_screen.gd",
	"leaderboard": "res://ui/screens/leaderboard_screen.gd",
	"settings": "res://ui/screens/settings_screen.gd",
}

var current_id: String = ""
var _current: ScreenBase
var _busy: bool = false
var _layer: Control


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_layer = Control.new()
	_layer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(_layer)
	var bg := ColorRect.new()
	bg.color = DesignTokens.BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg)
	move_child(bg, 0)
	navigate("splash")


func navigate(to: String, payload: Dictionary = {}) -> void:
	if _busy:
		return
	if to == current_id and _current != null:
		return
	if not SCREEN_PATHS.has(to):
		push_warning("Unknown screen: %s" % to)
		return
	_busy = true
	if _current:
		var fade_out := create_tween()
		fade_out.tween_property(_current, "modulate:a", 0.0, DesignTokens.SCREEN_FADE_MS)
		await fade_out.finished
		_current.on_exit()
		_current.queue_free()
		_current = null
	var script: GDScript = load(SCREEN_PATHS[to]) as GDScript
	var screen: ScreenBase = script.new() as ScreenBase
	screen.screen_id = to
	screen.modulate.a = 0.0
	screen.request_navigate.connect(navigate)
	_layer.add_child(screen)
	_current = screen
	current_id = to
	screen.on_enter(payload)
	var fade_in := create_tween()
	fade_in.tween_property(screen, "modulate:a", 1.0, DesignTokens.SCREEN_FADE_MS)
	await fade_in.finished
	_busy = false


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("debug_reference"):
		if GameState.debug_reference:
			GameState.clear_debug_reference()
		else:
			GameState.apply_debug_reference_state()
			if current_id != "gameplay":
				navigate("gameplay")
		get_viewport().set_input_as_handled()
