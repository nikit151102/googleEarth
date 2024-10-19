import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { environment } from './environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([]), // Add your routes here
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false, // Configure if you want to automatically log in the user
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('148312369953-3gueh3tcu3hjvdhrgl1nn41b2k4mu7tb.apps.googleusercontent.com'),
          }
        ],
        onError: (err) => {
          console.error(err); // Optionally handle errors here
        }
      } as SocialAuthServiceConfig,
    },
  ],
}).catch((err) => console.error(err));
