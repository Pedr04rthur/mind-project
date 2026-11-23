package com.mindproject.backend.domain.prescription;

public record PrescriptionItemData(String medicationName, String activeIngredient, String concentration, String pharmaceuticalForm, String dose, String route, String frequency, String duration, String quantity, String instructions) {
}
