class AppConfig {
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'http://localhost:3000', 
  );
  
  static const String authEndpoint = '/auth';
  static const String userEndpoint = '/user';
  static const String gymEndpoint = '/gym';
}