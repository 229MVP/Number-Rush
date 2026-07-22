class_name GridBackground
extends Control
## 32×32 electric-blue grid matching React GridBg.

@export var opacity: float = 0.05
@export var cell_size: float = 32.0


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	queue_redraw()


func set_opacity(op: float) -> void:
	opacity = op
	queue_redraw()


func _draw() -> void:
	var col := DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, opacity)
	var w := size.x
	var h := size.y
	var x := 0.0
	while x <= w:
		draw_line(Vector2(x, 0), Vector2(x, h), col, 1.0)
		x += cell_size
	var y := 0.0
	while y <= h:
		draw_line(Vector2(0, y), Vector2(w, y), col, 1.0)
		y += cell_size
