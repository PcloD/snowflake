class Flake < ActiveRecord::Base

  belongs_to :fragment_shader, class_name: "Code"
  belongs_to :vertex_shader, class_name: "Code"
  belongs_to :javascript, class_name: "Code"

  accepts_nested_attributes_for :fragment_shader, :vertex_shader, :javascript

  def as_json(options={})
    if options[:short]
      {
        id: self.id,
        name: self.name
      }
    else
      {
        id: self.id,
        name: self.name,
        vertex_shader: self.vertex_shader,
        fragment_shader: self.fragment_shader,
        javascript: self.javascript
      }
    end
  end

  def self.create_default(options={})
    base_path = File.join Rails.root, "public"
    javascript = File.read(File.join(base_path, "js", "default.js"))
    fragment_shader = File.read(File.join(base_path, "shaders", "default.frag"))
    vertex_shader = File.read(File.join(base_path, "shaders", "default.vert"))
    name = options[:name] || "New Flake"

    flake = new.tap do |flake|
      flake.name = name
      flake.fragment_shader = Code.new(code: fragment_shader, language: "glsl")
      flake.vertex_shader = Code.new(code: vertex_shader, language: "glsl")
      flake.javascript = Code.new(code: javascript, language: "js")
    end

    flake.save
    flake
  end

end
