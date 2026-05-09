export interface MedicalAnswers {
  maggiorenne: boolean;
  gravidanza: boolean;
  allergie: boolean;
  allergieDettagli?: string;
  anticoagulanti: boolean;
  cardiopatie: boolean;
  epilessia: boolean;
  malattieInfettive: boolean;
  diabete: boolean;
  accettaPermanenza: boolean;
  accettaPrivacy: boolean;
}

export interface ConsentSubmission {
  documentId: string;
  medicalAnswers: MedicalAnswers;
  signatureB64: string; // base64 PNG
}
