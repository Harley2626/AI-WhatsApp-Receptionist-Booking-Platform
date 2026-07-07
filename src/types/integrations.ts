export interface WhatsAppConfig {
  phone_number_id: string;
  display_phone_number?: string;
  waba_id?: string;
}

export interface WhatsAppSecrets {
  access_token: string;
}

export interface GoogleCalendarConfig {
  calendar_id: string;
  email?: string;
}

export interface GoogleCalendarSecrets {
  refresh_token: string;
  access_token?: string;
  access_token_expires_at?: string;
}

export interface PayFastConfig {
  merchant_id: string;
}

export interface PayFastSecrets {
  merchant_key: string;
  passphrase?: string;
}
