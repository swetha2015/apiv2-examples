import java.io.FileReader;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.scalr.ScalrAPI;

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

		ScalrAPI scalr = new ScalrAPI(api_url, api_key_id, api_key_secret);

		JSONArray list = null;
		JSONObject item = null;

		try {
			list = scalr.list("/api/v1beta0/account/os/?family=ubuntu");

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

		//List all operating systems
		try {
			list = scalr.list("/api/v1beta0/account/os/?family=ubuntu");

			for (int i=0; i < list.size(); i++) {
				item = (JSONObject) list.get(i);

				System.out.println(item);
				System.out.println(item.get("id"));
				System.out.println(item.get("name"));
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		//List all operating systems
		try {
			list = scalr.list("/api/v1beta0/account/os/?family=ubuntu");

			for (int i=0; i < list.size(); i++) {
				item = (JSONObject) list.get(i);

				System.out.println(item);
				System.out.println(item.get("id"));
				System.out.println(item.get("name"));
			}

		} catch (Exception e) {
			e.printStackTrace();
		}

		//Fetch specific operating system
		try {
			item = scalr.fetch(String.format("/api/v1beta0/user/os/%s", "ubuntu-12-10"));

			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));
		} catch (Exception e) {
			e.printStackTrace();
		}

		//List all role categories
		try {
			list = scalr.list(String.format("/api/v1beta0/user/%s/role-categories/", env_id));

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
			item = scalr.fetch(String.format("/api/v1beta0/user/%s/role-categories/%s", env_id, "3"));

			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));

		} catch (Exception e) {
			e.printStackTrace();
		}

		//List all roles
		try {
			list = scalr.list(String.format("/api/v1beta0/user/%s/roles/", env_id));

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
			item = scalr.fetch(String.format("/api/v1beta0/user/%s/roles/%s", env_id, 76131));

			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));

		} catch (Exception e) {
			e.printStackTrace();
		}

		//List all images
		try {
			list = scalr.list(String.format("/api/v1beta0/user/%s/images/", env_id));

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
			item = scalr.fetch(String.format("/api/v1beta0/user/%s/images/%s", env_id, "6b901494-a7da-8946-1722-8bd25ac75283"));

			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));

		} catch (Exception e) {
			e.printStackTrace();
		}

		//Create image
		try {
			Map os = new LinkedHashMap();
			os.put("id", "ubuntu-14-04");

			Map post = new LinkedHashMap();
			post.put("name","api-test-image-trusty-1");
			post.put("cloudImageId", "ami-10b68a78");
			post.put("cloudPlatform", "ec2");
			post.put("cloudLocation", "us-east-1");
			post.put("architecture", "x86_64");
			post.put("os", os);

			item = scalr.create(String.format("/api/v1beta0/user/%s/images/", env_id), JSONValue.toJSONString(post));

			System.out.println(item);
			System.out.println(item.get("id"));
			System.out.println(item.get("name"));

		} catch (Exception e) {
			System.out.println(e);
		}

		//Create role
		try {
			Map cat = new LinkedHashMap();
			cat.put("id", 1);

			Map os = new LinkedHashMap();
			os.put("id", "ubuntu-14-04");

			Map post = new LinkedHashMap();
			post.put("name", "api-test-role");
			post.put("category", cat);
			post.put("os", os);
			
			item = scalr.create(String.format("/api/v1beta0/user/%s/roles/", env_id), JSONValue.toJSONString(post));

			System.out.println(item);

		} catch (IOException e) {
			e.printStackTrace();
		}

		//Connect image to role
		try {
			Map post = new LinkedHashMap();
			post.put("image", "646539df-0ed0-b0db-c278-1f3c2e7183d6");
			
			item = scalr.create(String.format("/api/v1beta0/user/%s/roles/%s/images/", env_id, "76131"), JSONValue.toJSONString(post));

			System.out.println(item);

		} catch (IOException e) {
			e.printStackTrace();
		}

		//Replace image in role
		try {
			Map post = new LinkedHashMap();
			post.put("image", "6b901494-a7da-8946-1722-8bd25ac75283");
		
			item = scalr.post(String.format("/api/v1beta0/user/%s/roles/%s/images/%s/actions/replace/", env_id, "76131", "646539df-0ed0-b0db-c278-1f3c2e7183d6"), JSONValue.toJSONString(post));

			System.out.println(item);

		} catch (Exception e) {
			e.printStackTrace();
		}

		//Delete image
		try {
			scalr.delete(String.format("/api/v1beta0/user/%s/images/%s/", env_id, "646539df-0ed0-b0db-c278-1f3c2e7183d6"));
		} catch (Exception e) {
			e.printStackTrace();
		}

		*/

	}

}
