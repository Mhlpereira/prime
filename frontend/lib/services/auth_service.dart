// lib/services/auth_service.dart
import 'dart:convert';
import 'package:frontend/config/app_config.dart';
import 'package:frontend/services/auth_storage_service.dart';
import 'package:http/http.dart' as http;

class AuthService {
  final AuthStorageService _storage = AuthStorageService();
  
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String name,
    required DateTime birthday,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
          'birthday': birthday.toIso8601String(),
        }),
      );
      
      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        
        await _storage.saveTokens(
          accessToken: data['tokens']['accessToken'],
          refreshToken: data['tokens']['refreshToken'],
        );
        
        return data['user'];
      } else {
        throw Exception('Erro ao registrar: ${response.body}');
      }
    } catch (e) {
      throw Exception('Erro de conexão: $e');
    }
  }
  
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        await _storage.saveTokens(
          accessToken: data['tokens']['accessToken'],
          refreshToken: data['tokens']['refreshToken'],
        );
        
        return data['user'];
      } else {
        throw Exception('Credenciais inválidas');
      }
    } catch (e) {
      throw Exception('Erro de conexão: $e');
    }
  }
  
  Future<void> logout() async {
    await _storage.deleteTokens();
  }
}