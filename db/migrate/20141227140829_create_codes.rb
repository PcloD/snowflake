class CreateCodes < ActiveRecord::Migration
  def change
    create_table :codes do |t|
      t.timestamps
      t.text :code
      t.string :language
    end
  end
end
