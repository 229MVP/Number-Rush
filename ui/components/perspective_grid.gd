class_name PerspectiveGrid
extends Control
## Bottom perspective grid matching React PGrid (~180px tall).


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	custom_minimum_size = Vector2(0, 180)
	size_flags_vertical = Control.SIZE_SHRINK_END
	queue_redraw()
	resized.connect(queue_redraw)


func _draw() -> void:
	var w := size.x
	var h := size.y
	if w <= 0.0 or h <= 0.0:
		return
	var cx := w * 0.5
	for i in 10:
		var t := float(i) / 9.0
		var y := t * h
		var spread := cx * t * 1.9
		var alpha := 0.08 + t * 0.12
		var col := DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, alpha)
		draw_line(Vector2(cx - spread, y), Vector2(cx + spread, y), col, 0.8)
	for i in 9:
		var x2 := ((float(i) + 1.0) / 10.0) * w
		var col2 := DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.08)
		draw_line(Vector2(cx, 0), Vector2(x2, h), col2, 0.8)
