package com.mindproject.backend.domain.entity;

import com.mindproject.backend.domain.sex.Sex;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Professional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 11, unique = true)
    private String cpf;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Sex sex;

    private String phone;

    @Column(unique = true)
    private String email;

    private String address;

    private String crp;

    private String specialty;

    private String password;

    public Professional(String cpf, Sex sex, String phone, String email, String address, String crp, String specialty, String password) {
        this.cpf = cpf;
        this.sex = sex;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.crp = crp;
        this.specialty = specialty;
        this.password = password;
    }

    public void update(String cpf, Sex sex, String phone, String email, String address, String crp, String specialty, String password) {
        this.cpf = cpf;
        this.sex = sex;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.crp = crp;
        this.specialty = specialty;
        this.password = password;
    }
}
