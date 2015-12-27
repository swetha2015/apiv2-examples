package com.scalr;

import java.io.*;
import java.net.*;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.simple.*;
import org.json.simple.parser.*;

public class client {

	private String api_url;
	private String api_key_id;
	private String api_key_secret;

	public client(String url, String key_id, String key_secret) {
		this.api_url = url;
		this.api_key_id = key_id;
		this.api_key_secret = key_secret;		
	}

	private JSONObject request(String method, String url, String body) throws IOException, NoSuchAlgorithmException, InvalidKeyException, ParseException {

		URL urlParts = null;
		String uri = "";
		String query = "";
		String signature = null;

		//Split URL into components
		urlParts = new URL(api_url + url);
		uri = urlParts.getPath();

		if (urlParts.getQuery() != null) {
			query = urlParts.getQuery();

			//Convert querystring into an array
			String[] qParts = query.split("&");

			//Sort the querystring array
			Arrays.sort(qParts);

			//Convert querystring array back to a string
			query = String.join("&", qParts);
		}

		//Create ISO 8601 date/time string
		TimeZone tz = TimeZone.getTimeZone("UTC");
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'+00:00'");
		df.setTimeZone(tz);
		String time = df.format(new Date());

		//Collection of request data for generating signature
		String[] rParts = { 
			method,
			time,
			uri,
			query,
			body
		}; 
		String request = String.join("\n", rParts);

		//Calculate signature based on request data
		Mac mac = null;
		SecretKeySpec keySpec = new SecretKeySpec(api_key_secret.getBytes(), "HmacSHA256");
		mac = Mac.getInstance("HmacSHA256");
		mac.init(keySpec);
		signature = "V1-HMAC-SHA256 " + new String(Base64.getEncoder().encode(mac.doFinal(request.getBytes())));

		HttpURLConnection connection = null;  

		StringBuilder response = new StringBuilder();

		//Create connection
		connection = (HttpURLConnection) urlParts.openConnection();
		connection.setUseCaches(false);
		connection.setDoOutput(true);
		connection.setRequestMethod(method);

		connection.setRequestProperty("X-Scalr-Key-Id", api_key_id);
		connection.setRequestProperty("X-Scalr-Signature", signature);
		connection.setRequestProperty("X-Scalr-Date", time);

		//Send body
		if (body != "") {
			connection.setRequestProperty("Content-Type", "application/json");

			DataOutputStream wr = new DataOutputStream(connection.getOutputStream());
			wr.writeBytes(body);
			wr.close();
		}

		//Get Response
		InputStream is = connection.getInputStream();
		BufferedReader rd = new BufferedReader(new InputStreamReader(is));

		String line;

		while((line = rd.readLine()) != null) {
			response.append(line);
			response.append('\r');
		}

		rd.close();

		JSONObject json = null;
		JSONParser parser = new JSONParser();
		json = (JSONObject) parser.parse(response.toString());

		return json;

	}

	@SuppressWarnings("unchecked")
	//List items from API
	public JSONArray list(String url) throws Exception {

		JSONObject response;
		JSONArray data = new JSONArray();
		JSONArray parts;

		while (url != null) {
			response = this.request("GET", url, "");
			if (response == null) return null;

			parts = (JSONArray) response.get("data");
			for (int i=0; i < parts.size(); i++) data.add(parts.get(i));

			url = (String) ((JSONObject) response.get("pagination")).get("next");
		}

		return data;
	}

	//Fetch a single item from API
	public JSONObject fetch(String url) throws Exception {
		JSONObject response = this.request("GET", url, "");
		return (JSONObject) response.get("data");
	}

	//Create item in API
	public JSONObject create(String url, String data) throws Exception {
		JSONObject response = this.request("POST", url, data);
		return (JSONObject) response.get("data");
	}

	//Delete item from API
	public void delete(String url) throws Exception {
		this.request("DELETE", url, "");
	}

	//Edit items in API
	public JSONObject post(String url, String data) throws Exception {
		JSONObject response = this.request("POST", url, data);
		return (JSONObject) response.get("data");
	}

}
