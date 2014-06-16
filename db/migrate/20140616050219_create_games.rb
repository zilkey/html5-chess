class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.string :uuid
      t.string :timestamps
    end
  end
end
