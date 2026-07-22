extends Node
## Loads Lucide PNG icons for tinting in TextureRect / buttons.

var _cache: Dictionary = {}


func get_icon(name: String) -> Texture2D:
	if _cache.has(name):
		return _cache[name]
	var path := "res://assets/icons/%s.png" % name
	if not ResourceLoader.exists(path):
		# try svg path fallback
		path = "res://assets/icons/%s.svg" % name
	var tex: Texture2D = load(path) as Texture2D
	if tex == null:
		push_warning("Icon missing: %s" % name)
		tex = _placeholder()
	_cache[name] = tex
	return tex


func make_texture_rect(name: String, size: int, color: Color) -> TextureRect:
	var tr := TextureRect.new()
	tr.texture = get_icon(name)
	tr.custom_minimum_size = Vector2(size, size)
	tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	tr.modulate = color
	tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return tr


func _placeholder() -> ImageTexture:
	var img := Image.create(32, 32, false, Image.FORMAT_RGBA8)
	img.fill(Color(1, 1, 1, 1))
	return ImageTexture.create_from_image(img)
