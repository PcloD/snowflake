class Flake < ActiveRecord::Base
  belongs_to :fragment_shader, class_name: "Code"
  belongs_to :vertex_shader, class_name: "Code"
  belongs_to :javascript, class_name: "Code"
end
