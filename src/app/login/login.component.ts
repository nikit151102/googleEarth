import { GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {


  constructor(private authService: SocialAuthService) { }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
      console.log(user);
      // Здесь вы можете работать с токеном или профилем пользователя
      const googleToken = user.idToken;
    });
  }

  signOut(): void {
    this.authService.signOut();
  }
  
}
