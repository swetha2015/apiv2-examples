require 'json'

load 'ScalrAPI.rb'

#Load config
begin
	config = JSON.parse(IO.read('config.json'))
rescue
	abort('config.json file is missing')
end

scalr = ScalrAPI.new(config['api_url'], config['api_key_id'], config['api_key_secret'])

#List all operating systems
begin
	list = scalr.list('/api/v1beta0/account/os/?family=ubuntu')
	
	puts list
rescue Exception => e  
	puts e.response
end



=begin

#List all operating systems
begin
	list = scalr.list('/api/v1beta0/account/os/?family=ubuntu')
	
	puts list
rescue Exception => e  
	puts e.response
end

#Fetch specific operating system
begin
	item = scalr.fetch('/api/v1beta0/account/os/%s' % ['ubuntu-10-10'])
	
	puts item
rescue Exception => e  
	puts e.response
end

#List role categories
begin
	list = scalr.list('/api/v1beta0/user/%s/role-categories/' % [config['env_id']])
	
	puts list
rescue Exception => e  
	puts e.response
end

#Fetch specific role category
begin
	item = scalr.fetch('/api/v1beta0/user/%s/role-categories/%s' % [config['env_id'], '8'])
	
	puts item
rescue Exception => e  
	puts e.response
end

#List all roles
begin
	list = scalr.list('/api/v1beta0/user/%s/roles/' % [config['env_id']])
	
	puts list
rescue Exception => e  
	puts e.response
end

#Fetch specific role
begin
	item = scalr.fetch('/api/v1beta0/user/%s/roles/%s' % [config['env_id'], '76131'])
	
	puts item
rescue Exception => e  
	puts e.response
end

#List all images
begin
	list = scalr.list('/api/v1beta0/user/%s/images/' % [config['env_id']])
	
	puts list
rescue Exception => e  
	puts e.response
end

#Fetch specific image
begin
	item = scalr.fetch('/api/v1beta0/user/%s/images/%s' % [config['env_id'], '6b901494-a7da-8946-1722-8bd25ac75283'])
	
	puts item
rescue Exception => e  
	puts e.response
end

#Create image
begin
	item = scalr.create('/api/v1beta0/user/%s/images/' % [config['env_id']], {
		'name' => 'api-test-image-trusty-1',
		'cloudImageId' => 'ami-10b68a78',
		'cloudPlatform' => 'ec2',
		'cloudLocation' => 'us-east-1',
		'architecture' => 'x86_64',
		'os' => {
			'id' => 'ubuntu-14-04'
		}
	})
	
	puts item
rescue Exception => e  
	puts e.response
end

#Create role
begin
	item = scalr.create('/api/v1beta0/user/%s/roles/' % [config['env_id']], {
		'name' => 'api-test-role',
		'category' => {
			'id' => 1
		},
		'os' => {
			'id' => 'ubuntu-14-04'
		}
	})
	
	puts item
rescue Exception => e  
	puts e.response
end

#Connect image to role
begin
	item = scalr.create('/api/v1beta0/user/%s/roles/%s/images/' % [config['env_id'], '76131'], {
		'image' => '646539df-0ed0-b0db-c278-1f3c2e7183d6'
	})
	
	puts item
rescue Exception => e  
	puts e.response
end

#Replace image in role
begin
	item = scalr.post('/api/v1beta0/user/%s/roles/%s/images/%s/actions/replace/' % [config['env_id'], '76131', '646539df-0ed0-b0db-c278-1f3c2e7183d6'], {
		'image' => '6b901494-a7da-8946-1722-8bd25ac75283'
	})
	
	puts item
rescue Exception => e  
	puts e.response
end

#Delete image
begin
	item = scalr.delete('/api/v1beta0/user/%s/images/%s/' % [config['env_id'], '646539df-0ed0-b0db-c278-1f3c2e7183d6'])
	
	puts item
rescue Exception => e  
	puts e.response
end

=end
