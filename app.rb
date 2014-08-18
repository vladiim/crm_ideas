require 'sinatra'

get '/' do
  # erb :index, locals: { categories: [cyber, brand, innovation, media, promo, film] }
  erb :index
end