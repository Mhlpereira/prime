import 'package:flutter/material.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';

final TextEditingController _emailController = TextEditingController();
final TextEditingController _senhaController = TextEditingController();
final TextEditingController _confirmarSenhaController = TextEditingController();
final TextEditingController _nameController = TextEditingController();
final TextEditingController _birthdayController = TextEditingController();

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: Colors.blue[700],
        padding: EdgeInsets.all(16),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    SizedBox(height: 16),
                    TextField(
                      controller: _emailController,
                      decoration: InputDecoration(hintText: 'Email'),
                    ),

                    SizedBox(height: 16),
                    TextField(
                      controller: _nameController,
                      decoration: InputDecoration(hintText: 'Nome'),
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: _birthdayController,
                      decoration: InputDecoration(
                        hintText: 'Data de nascimento',
                      ),
                      inputFormatters: [
                        MaskTextInputFormatter(mask: '##/##/####'),
                      ],
                      keyboardType: TextInputType.datetime,
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: _senhaController,
                      decoration: InputDecoration(hintText: 'Senha'),
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: _confirmarSenhaController,
                      decoration: InputDecoration(hintText: 'Confirmar senha'),
                    ),
                    SizedBox(height: 20,),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      
                      
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
