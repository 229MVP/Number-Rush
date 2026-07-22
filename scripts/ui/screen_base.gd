class_name ScreenBase
extends Control
## Base screen with optional bottom nav hook.

signal request_navigate(screen_id: String)

var screen_id: String = ""


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP


func on_enter(_payload: Dictionary = {}) -> void:
	pass


func on_exit() -> void:
	pass


func nav(to: String) -> void:
	request_navigate.emit(to)
