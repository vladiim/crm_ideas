require 'sinatra'

use Rack::Auth::Basic, "Protected Area" do |username, password|
  username == ENV['AUDI_CRM_IDEAS_U'] && password == ENV['AUDI_CRM_IDEAS_P']
end

get '/' do
  # erb :index, locals: { categories: [cyber, brand, innovation, media, promo, film] }
  erb :index
end