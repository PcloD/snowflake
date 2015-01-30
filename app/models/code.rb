class Code < ActiveRecord::Base

  def as_json(options={})
    {
      code: code,
      type: language
    }
  end
end
