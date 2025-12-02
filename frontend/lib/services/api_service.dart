import 'package:frontend/config/app_config.dart';
import 'package:frontend/services/auth_storage_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  final AuthStorageService _storage = AuthStorageService();
  
  Future<http.Response> get(String endpoint) async {
    final token = await _storage.getAccessToken();
    
    return await http.get(
      Uri.parse('${AppConfig.baseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
  }
  
  Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final token = await _storage.getAccessToken();
    
    return await http.post(
      Uri.parse('${AppConfig.baseUrl}$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
  }
}