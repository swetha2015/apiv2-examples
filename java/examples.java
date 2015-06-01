import java.io.FileReader;
import java.io.IOException;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.scalr.*;

public class examples {

	public static void main(String[] args) {
		
		JSONParser parser = new JSONParser();
		JSONObject json = null;

		String api_url = null;
		String api_key_id = null;
		String api_key_secret = null;
		String env_id = null;
		
		//Read config
		try {
			json = (JSONObject) parser.parse(new FileReader("config.json"));
			
			api_url = (String) json.get("api_url");
			api_key_id = (String) json.get("api_key_id");
			api_key_secret = (String) json.get("api_key_secret");
			env_id = (String) json.get("env_id");
			
		} catch (IOException | ParseException e) {
			e.printStackTrace();
		}
		
		client scalr = new client(api_url, api_key_id, api_key_secret);
		
		JSONArray list = null;
		JSONObject item = null;

		//List all operating systems
		try {
			list = scalr.list("/api/user/v1beta0/os/?family=ubuntu");
			
			for (int i=0; i < list.size(); i++) {
				item = (JSONObject) list.get(i);
				
				System.out.println(item);
				System.out.println(item.get("id"));
				System.out.println(item.get("name"));
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		/*

		//Fetch specific operating system
		try {
			item = scalr.fetch(String.format("/api/user/v1beta0/os/%s", "ubuntu-12-10"));
			
			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));
		} catch (Exception e) {
			e.printStackTrace();
		}

		//List all role categories
		try {
			list = scalr.list(String.format("/api/user/v1beta0/%s/role-categories/", env_id));
			
			for (int i=0; i < list.size(); i++) {
				item = (JSONObject) list.get(i);
				
				System.out.println(item);
				System.out.println(item.get("id"));
				System.out.println(item.get("name"));
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}

		//Fetch specific role category
		try {
			item = scalr.fetch(String.format("/api/user/v1beta0/%s/role-categories/%s", env_id, "3"));
			
			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));
			
		} catch (Exception e) {
			e.printStackTrace();
		}

		//List all roles
		try {
			list = scalr.list(String.format("/api/user/v1beta0/%s/roles/", env_id));
			
			for (int i=0; i < list.size(); i++) {
				item = (JSONObject) list.get(i);
				
				System.out.println(item);
				System.out.println(item.get("id"));
				System.out.println(item.get("name"));
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}

		//Fetch specific role
		try {
			item = scalr.fetch(String.format("/api/user/v1beta0/%s/roles/%s", env_id, 76131));
			
			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));
			
		} catch (Exception e) {
			e.printStackTrace();
		}

		//List all images
		try {
			list = scalr.list(String.format("/api/user/v1beta0/%s/images/", env_id));
			
			for (int i=0; i < list.size(); i++) {
				item = (JSONObject) list.get(i);
				
				System.out.println(item);
				System.out.println(item.get("cloudImageId"));
				System.out.println(item.get("name"));
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		//Fetch specific image
		try {
			item = scalr.fetch(String.format("/api/user/v1beta0/%s/images/%s", env_id, "6b901494-a7da-8946-1722-8bd25ac75283"));
			
			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));
			
		} catch (Exception e) {
			e.printStackTrace();
		}

		//Create image
		try {
			item = scalr.create(String.format("/api/user/v1beta0/%s/images/", env_id), "{" +
				"\"name\": \"api-test-image-trusty-1\"," +
				"\"cloudImageId\": \"ami-10b68a78\"," +
				"\"cloudPlatform\": \"ec2\"," +
				"\"cloudLocation\": \"us-east-1\"," +
				"\"architecture\": \"x86_64\"," +
				"\"os\": {" +
					"\"id\": \"ubuntu-14-04\"" +
				"}" +
			"}");
			
			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));

		} catch (Exception e) {
			System.out.println(e);
		}
		
		//Create role
		try {
			item = scalr.create(String.format("/api/user/v1beta0/%s/roles/", env_id), "{" +
				"\"name\": \"api-test-role\"," +
				"\"category\": {" +
					"\"id\": 1" +
				"}," +
				"\"os\": {" +
					"\"id\": \"ubuntu-14-04\"" +
				"}" +
			"}");
			
			System.out.println(item);
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		//Connect image to role
		try {
			item = scalr.create(String.format("/api/user/v1beta0/%s/roles/%s/images/", env_id, "76131"), "{" +
				"\"image\": \"646539df-0ed0-b0db-c278-1f3c2e7183d6\"" +
			"}");

			System.out.println(item);

		} catch (IOException e) {
			e.printStackTrace();
		}

		//Replace image in role
		try {
			item = scalr.post(String.format("/api/user/v1beta0/%s/roles/%s/images/%s/actions/replace/", env_id, "76131", "646539df-0ed0-b0db-c278-1f3c2e7183d6"), "{" +
				"\"image\": \"6b901494-a7da-8946-1722-8bd25ac75283\"" +
			"}");
			
			System.out.println(item);
			
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		//Delete image
		try {
			scalr.delete(String.format("/api/user/v1beta0/%s/images/%s/", env_id, "646539df-0ed0-b0db-c278-1f3c2e7183d6"));
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		*/
		
	}

}
