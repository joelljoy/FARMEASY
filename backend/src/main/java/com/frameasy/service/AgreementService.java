package com.frameasy.service;

import com.frameasy.dto.AgreementDto;
import com.frameasy.dto.AgreementRequest;
import com.frameasy.model.*;
import com.frameasy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgreementService {

    private final AgreementRepository agreementRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final LandRepository landRepository;
    private final TradeRepository tradeRepository;
    private final OtpService otpService;
    private final PdfService pdfService;
    private final JavaMailSender mailSender;

    @Value("${upload.dir:./uploads}")
    private String uploadDir;

    public void sendAgreementOtp(String buyerEmail) {
        otpService.createAndSendOtp(buyerEmail, "AGREEMENT");
    }

    /**
     * Creates a new agreement between a buyer and a seller for a specific item (Equipment, Land, or Trade).
     * Validates the buyer's OTP before proceeding. If valid, generates a PDF of the agreement
     * and automatically emails it to both parties.
     * Additionally, updates the availability status of Equipment or Land to "Rented".
     *
     * @param buyerId The ID of the user purchasing or renting the item.
     * @param req     The agreement request containing details such as reference ID, price, and terms.
     * @return The created AgreementDto, or null if OTP validation fails or the item is not found.
     */
    @Transactional
    public AgreementDto createAgreement(Long buyerId, AgreementRequest req) {
        if (!otpService.verifyOtp(userRepository.findById(buyerId).map(User::getEmail).orElse(""), req.getOtp(), "AGREEMENT")) {
            return null; // caller should check and return error
        }
        User seller = null;
        String itemTitle = "";
        String itemDetails = "";

        if ("EQUIPMENT".equals(req.getAgreementType())) {
            Equipment eq = equipmentRepository.findById(req.getReferenceId()).orElse(null);
            if (eq == null) return null;
            
            // Mark as rented
            eq.setAvailability("Rented");
            equipmentRepository.save(eq);
            
            seller = userRepository.findById(eq.getUserId()).orElse(null);
            itemTitle = eq.getTitle();
            itemDetails = "Equipment: " + eq.getTitle() + ", Price per day: " + eq.getPricePerDay() + ", Location: " + eq.getLocation();
        } else if ("LAND".equals(req.getAgreementType())) {
            Land land = landRepository.findById(req.getReferenceId()).orElse(null);
            if (land == null) return null;
            
            // Mark as rented
            land.setAvailability("Rented");
            landRepository.save(land);
            
            seller = userRepository.findById(land.getUserId()).orElse(null);
            itemTitle = land.getTitle();
            itemDetails = "Land: " + land.getTitle() + ", Price per month: " + land.getPricePerMonth() + ", Area: " + land.getArea();
        } else if ("TRADE".equals(req.getAgreementType())) {
            Trade trade = tradeRepository.findById(req.getReferenceId()).orElse(null);
            if (trade == null) return null;
            seller = userRepository.findById(trade.getUserId()).orElse(null);
            itemTitle = trade.getCropName();
            itemDetails = "Crop: " + trade.getCropName() + ", Price per unit: " + trade.getPricePerUnit() + ", Quantity: " + trade.getQuantity();
        }
        if (seller == null) return null;

        Agreement ag = Agreement.builder()
                .agreementType(req.getAgreementType())
                .referenceId(req.getReferenceId())
                .sellerId(seller.getId())
                .buyerId(buyerId)
                .buyerName(req.getBuyerName())
                .finalPrice(req.getFinalPrice())
                .dueDate(req.getDueDate())
                .terms(req.getTerms())
                .signedAt(Instant.now())
                .build();
        ag = agreementRepository.save(ag);

        try {
            byte[] pdfBytes = pdfService.generateAgreementPdf(ag, itemTitle, itemDetails);
            String filename = "agreement_" + ag.getId() + ".pdf";
            String path = pdfService.savePdf(pdfBytes, "agreements", filename);
            ag.setPdfPath(path);
            agreementRepository.save(ag);

            User buyer = userRepository.findById(buyerId).orElse(null);
            if (buyer != null) {
                sendPdfByEmail(seller.getEmail(), buyer.getEmail(), pdfBytes, ag.getId());
            }
        } catch (Exception e) {
            // log
        }

        return toDto(ag);
    }

    private void sendPdfByEmail(String sellerEmail, String buyerEmail, byte[] pdfBytes, Long agreementId) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true);
            helper.setTo(sellerEmail);
            helper.setSubject("FARM EASY - Agreement #" + agreementId);
            helper.setText("Please find the attached agreement document.");
            helper.addAttachment("agreement_" + agreementId + ".pdf", new ByteArrayResource(pdfBytes));
            mailSender.send(msg);

            msg = mailSender.createMimeMessage();
            helper = new MimeMessageHelper(msg, true);
            helper.setTo(buyerEmail);
            helper.setSubject("FARM EASY - Agreement #" + agreementId);
            helper.setText("Please find the attached agreement document.");
            helper.addAttachment("agreement_" + agreementId + ".pdf", new ByteArrayResource(pdfBytes));
            mailSender.send(msg);
        } catch (Exception e) {
            // log
        }
    }

    @Transactional(readOnly = true)
    public List<AgreementDto> listByUser(Long userId) {
        return agreementRepository.findBySellerIdOrBuyerId(userId, userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AgreementDto getById(Long id) {
        return agreementRepository.findById(id).map(this::toDto).orElse(null);
    }

    private AgreementDto toDto(Agreement a) {
        AgreementDto dto = new AgreementDto();
        dto.setId(a.getId());
        dto.setAgreementType(a.getAgreementType());
        dto.setReferenceId(a.getReferenceId());
        dto.setSellerId(a.getSellerId());
        dto.setBuyerId(a.getBuyerId());
        dto.setBuyerName(a.getBuyerName());
        dto.setFinalPrice(a.getFinalPrice());
        dto.setDueDate(a.getDueDate());
        dto.setTerms(a.getTerms());
        dto.setPdfPath(a.getPdfPath());
        dto.setSignedAt(a.getSignedAt());
        dto.setDownloadUrl(a.getPdfPath());
        return dto;
    }
}
