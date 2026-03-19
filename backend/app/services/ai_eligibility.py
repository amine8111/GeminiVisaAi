"""
Advanced Visa Eligibility Scoring Engine
Based on real-world visa approval factors and research
"""


def calculate_eligibility(user_profile, application_data):
    """
    Realistic visa eligibility prediction based on research:
    - Financial stability (30%): Income, savings, funds availability
    - Strong ties to home country (25%): Property, family, employment
    - Travel history (20%): Previous visas, compliance
    - Application integrity (15%): Complete documentation, clear purpose
    - Risk factors (10%): Red flags that could cause refusal
    """

    score = 0
    max_score = 100
    reasons_high = []
    reasons_low = []
    advice = []

    # Extract data with defaults
    income = float(user_profile.get("monthly_income") or 0)
    savings = float(user_profile.get("bank_balance_avg_6m") or 0)
    trip_cost = float(application_data.get("estimated_trip_cost") or 0)
    destination = (application_data.get("destination_country") or "").lower()
    purpose = (application_data.get("purpose_of_travel") or "").lower()
    employment = user_profile.get("employment_status") or ""
    has_property = user_profile.get("has_property", False)
    dependents = int(user_profile.get("has_dependents") or 0)
    prior_travel = user_profile.get("prior_international_travel", False)
    prior_schengen = user_profile.get("prior_schengen_visa", False)
    prior_us_uk = user_profile.get("prior_us_uk_canada_visa", False)
    prior_canada = user_profile.get("prior_canada_visa", False)
    refused = user_profile.get("ever_refused_visa", False)
    refusal_details = user_profile.get("refusal_details") or ""

    # Calculate days of trip
    try:
        start = application_data.get("intended_travel_start")
        end = application_data.get("intended_travel_end")
        if start and end:
            from datetime import datetime

            trip_days = (
                datetime.strptime(end, "%Y-%m-%d")
                - datetime.strptime(start, "%Y-%m-%d")
            ).days
        else:
            trip_days = 7
    except:
        trip_days = 7

    # ============================================
    # 1. FINANCIAL STABILITY (30 points max)
    # ============================================
    financial_score = 0

    # Monthly income scoring (15 points max)
    # Different thresholds for different destinations
    if destination in [
        "united states",
        "usa",
        "united kingdom",
        "uk",
        "canada",
        "australia",
    ]:
        # Higher income requirements for these countries
        if income >= 8000:
            financial_score += 15
            reasons_high.append(f"Excellent monthly income (${income:,.0f})")
        elif income >= 5000:
            financial_score += 12
            reasons_high.append(f"Good monthly income (${income:,.0f})")
        elif income >= 3000:
            financial_score += 8
            reasons_high.append(f"Decent monthly income (${income:,.0f})")
        elif income >= 2000:
            financial_score += 4
            reasons_low.append(
                f"Income below average for {destination} ({income:,.0f})"
            )
        else:
            reasons_low.append(f"Insufficient income for {destination}")
    else:
        # More lenient for other destinations (Schengen, etc)
        if income >= 5000:
            financial_score += 15
            reasons_high.append(f"Strong monthly income (${income:,.0f})")
        elif income >= 3000:
            financial_score += 12
            reasons_high.append(f"Good monthly income (${income:,.0f})")
        elif income >= 2000:
            financial_score += 8
            reasons_high.append(f"Adequate monthly income (${income:,.0f})")
        elif income >= 1000:
            financial_score += 4
        else:
            reasons_low.append("Insufficient monthly income")

    # Savings/Bank balance (15 points max)
    # For tourism: need at least $50/day of trip in savings
    # For business: need more
    required_savings = trip_cost * 1.5  # Conservative estimate

    if savings >= required_savings * 2:
        financial_score += 15
        reasons_high.append(f"Excellent savings (${savings:,.0f})")
    elif savings >= required_savings:
        financial_score += 12
        reasons_high.append(f"Adequate savings for trip (${savings:,.0f})")
    elif savings >= required_savings * 0.5:
        financial_score += 6
        reasons_low.append(f"Savings may be insufficient for full trip")
    else:
        financial_score += 0
        reasons_low.append(
            f"Insufficient savings (${savings:,.0f} vs required ${required_savings:,.0f})"
        )

    # ============================================
    # 2. STRONG TIES TO HOME COUNTRY (25 points max)
    # ============================================
    ties_score = 0

    # Employment status
    if employment in ["Employed", "Business Owner", "Self-Employed"]:
        ties_score += 10
        reasons_high.append(f"Stable employment ({employment})")
    elif employment == "Student":
        ties_score += 3
        reasons_low.append("Student status - ensure proof of enrollment")
    else:
        reasons_low.append("No stable employment - may raise concerns")

    # Property ownership
    if has_property:
        ties_score += 10
        reasons_high.append("Property ownership shows strong home ties")

    # Family ties (dependents in home country)
    if dependents > 0 and dependents <= 3:
        ties_score += 5
        reasons_high.append(f"Family ties in home country ({dependents} dependents)")
    elif dependents > 3:
        ties_score += 3
        reasons_high.append(f"Large family (may strengthen ties)")

    # ============================================
    # 3. TRAVEL HISTORY (20 points max)
    # ============================================
    travel_score = 0

    if prior_travel:
        travel_score += 5

    # Previous visas of same type
    if "schengen" in destination or destination in [
        "france",
        "germany",
        "italy",
        "spain",
        "netherlands",
    ]:
        if prior_schengen:
            travel_score += 15
            reasons_high.append("Prior Schengen visa - proven travel compliance")
        else:
            travel_score += 0
            reasons_low.append("No prior Schengen visa - first-time applicant")
    elif "united states" in destination or "usa" in destination:
        if prior_us_uk:
            travel_score += 10
            reasons_high.append("Prior US/UK visa - strong track record")
        else:
            travel_score += 0
            reasons_low.append("No prior US visa - interview required")
    elif "united kingdom" in destination or "uk" in destination:
        if prior_us_uk:
            travel_score += 10
            reasons_high.append("Prior US/UK visa - strong track record")
        else:
            travel_score += 0
            reasons_low.append("No prior UK visa")
    elif "canada" in destination:
        if prior_canada:
            travel_score += 10
            reasons_high.append("Prior Canadian visa")
        else:
            travel_score += 0

    # ============================================
    # 4. APPLICATION INTEGRITY (15 points max)
    # ============================================
    integrity_score = 0

    # Clear purpose of travel
    if purpose in ["tourism", "business", "visit family"]:
        integrity_score += 5
    else:
        integrity_score += 3

    # Trip duration合理性
    if trip_days <= 30:
        integrity_score += 5
    elif trip_days <= 90:
        integrity_score += 3
    else:
        integrity_score += 0
        reasons_low.append(f"Long trip ({trip_days} days) - may raise concerns")

    # Cost reasonable for income
    if income > 0:
        cost_to_income_ratio = trip_cost / (income * 12)
        if cost_to_income_ratio <= 0.3:
            integrity_score += 5
        elif cost_to_income_ratio <= 0.5:
            integrity_score += 3
            reasons_low.append("Trip cost is high relative to income")
        else:
            reasons_low.append("Trip cost unrealistic for income level")

    # ============================================
    # 5. RISK FACTORS (10 points penalty max)
    # ============================================
    risk_penalty = 0

    if refused:
        risk_penalty += 10
        reasons_low.append("Previous visa refusal on record")
        if refusal_details:
            advice.append(f"Refusal details: {refusal_details}")

    # ============================================
    # CALCULATE FINAL SCORE
    # ============================================
    score = financial_score + ties_score + travel_score + integrity_score - risk_penalty
    score = max(0, min(100, score))

    # ============================================
    # GENERATE ADVICE
    # ============================================
    if score >= 80:
        advice.append(
            "Strong profile - high chance of approval. Ensure all documents are accurate and submit well before your travel date."
        )
    elif score >= 60:
        advice.append(
            "Good profile with some concerns. Strengthen your application with: employment letter, bank statements (3+ months), travel insurance, and hotel bookings."
        )
    elif score >= 40:
        advice.append(
            "Moderate eligibility. Recommended actions: increase savings, get employment verification, provide clear itinerary, consider applying for visitor visa first if rejected."
        )
    else:
        advice.append(
            "Low eligibility. Consider: strengthening financial documentation, reducing trip duration, applying for visa through proper channels, or consulting with immigration lawyer."
        )

    # Country-specific advice
    if "schengen" in destination or destination in [
        "france",
        "germany",
        "italy",
        "spain",
        "netherlands",
    ]:
        advice.append(
            "SCHENGEN: Ensure travel insurance covering min €30,000, hotel bookings for all nights, return flight, and sufficient daily funds (€75/day minimum)."
        )

    if "united states" in destination or "usa" in destination:
        advice.append(
            "USA: Mandatory interview at embassy. Apply 3-6 months ahead. Prepare for questions about itinerary, employment, and ties to home country."
        )

    if "united kingdom" in destination or "uk" in destination:
        advice.append(
            "UK: 3-month bank statements required. Funds must show consistently. No savings from loans. Proof of accommodation required."
        )

    if "canada" in destination:
        advice.append(
            "CANADA: Letter of invitation if visiting family/friends. Proof of employment. Medical exam may be required for longer stays."
        )

    if "australia" in destination:
        advice.append(
            "AUSTRALIA: Apply 6-12 weeks ahead. May require health check. Subclass 600 tourist visa has strict requirements for first-time visitors."
        )

    return {
        "probability": score,
        "reasons_high": reasons_high[:6],
        "reasons_low": reasons_low[:4],
        "advice": advice,
    }


def generate_milestone_plan(score, user_profile, application_data):
    """
    Generate a personalized milestone plan for users with low eligibility score.
    Creates a long-term or medium-term plan with actionable milestones.
    """
    income = float(user_profile.get("monthly_income") or 0)
    savings = float(user_profile.get("bank_balance_avg_6m") or 0)
    employment = user_profile.get("employment_status") or ""
    has_property = user_profile.get("has_property", False)
    destination = (application_data.get("destination_country") or "").lower()
    trip_cost = float(application_data.get("estimated_trip_cost") or 0)

    milestones = []
    current_time = 0

    # Phase 1: Financial Preparation (Months 1-3)
    if income < 3000 or savings < trip_cost:
        months_needed = max(
            3, int((trip_cost * 1.5 - savings) / max(income * 0.5, 500))
        )
        milestones.append(
            {
                "phase": "Financial Preparation",
                "week": 1,
                "title": "Create Budget Plan",
                "description": "Analyze your monthly expenses and create a savings plan. Target saving 30-50% of monthly income.",
                "action_items": [
                    "Track all expenses for 1 month",
                    "Identify areas to cut costs",
                    "Set up automatic savings transfer",
                    "Open a dedicated travel fund account",
                ],
                "notification": "Start your savings journey! Set up automatic transfers to build your travel fund.",
            }
        )

        milestones.append(
            {
                "phase": "Financial Preparation",
                "week": 4,
                "title": "Increase Income Sources",
                "description": "Explore ways to increase your income: freelance work, part-time job, or sell unused items.",
                "action_items": [
                    "List skills for freelance work",
                    "Check gig economy platforms",
                    "Consider weekend/part-time opportunities",
                ],
                "notification": "Consider adding extra income sources to reach your savings goal faster!",
            }
        )

        milestones.append(
            {
                "phase": "Financial Preparation",
                "week": 8,
                "title": "Build Emergency Fund",
                "description": "Build 3 months of expenses as emergency fund before focusing on travel savings.",
                "action_items": [
                    "Save 3x monthly expenses",
                    "Keep emergency fund accessible",
                    "Don't touch for non-emergencies",
                ],
                "notification": "Having an emergency fund gives you financial security while you save for travel!",
            }
        )

    # Phase 2: Documentation (Months 3-6)
    milestones.append(
        {
            "phase": "Documentation",
            "week": 12,
            "title": "Gather Essential Documents",
            "description": "Start collecting all required documents for visa application.",
            "action_items": [
                "Valid passport (check expiry - should be 6+ months)",
                "Past educational certificates",
                "Employment verification letters",
                "ID proofs",
            ],
            "notification": "Time to organize your documents! A well-prepared application increases approval chances.",
        }
    )

    milestones.append(
        {
            "phase": "Documentation",
            "week": 16,
            "title": "Prepare Financial Documents",
            "description": "Organize bank statements, employment letters, and income proofs.",
            "action_items": [
                "Get bank statements (last 3-6 months)",
                "Request employment verification letter",
                "Prepare tax returns if self-employed",
                "List all assets and properties",
            ],
            "notification": "Strong financial documentation is key! Start gathering your bank statements now.",
        }
    )

    # Phase 3: Application Preparation (Months 6-9)
    if score < 50:
        milestones.append(
            {
                "phase": "Strengthen Profile",
                "week": 24,
                "title": "Build Travel History",
                "description": "If possible, build travel history with easier visas first.",
                "action_items": [
                    "Consider applying for easier destinations first",
                    "Domestic travel doesn't help - focus on neighboring countries",
                    "Keep all travel documents",
                ],
                "notification": "Building travel history takes time. Consider starting with countries that have simpler visa processes!",
            }
        )

    milestones.append(
        {
            "phase": "Application Prep",
            "week": 28,
            "title": "Research Visa Requirements",
            "description": "Deep dive into specific requirements for your destination.",
            "action_items": [
                "Check embassy website for requirements",
                "Download application forms",
                "Note processing times",
                "Check interview requirements",
            ],
            "notification": "Research is key! Each country has different requirements. Start checking your destination's embassy website.",
        }
    )

    milestones.append(
        {
            "phase": "Application Prep",
            "week": 32,
            "title": "Prepare Application",
            "description": "Fill forms accurately and prepare for submission.",
            "action_items": [
                "Fill application forms accurately",
                "Get photos meeting specifications",
                "Book flight (refundable if needed)",
                "Get travel insurance quote",
            ],
            "notification": "Almost time to apply! Make sure all your documents are ready and accurate.",
        }
    )

    # Phase 4: Apply
    milestones.append(
        {
            "phase": "Application",
            "week": 36,
            "title": "Submit Application",
            "description": "Submit your visa application with all supporting documents.",
            "action_items": [
                "Double-check all forms",
                "Submit online or at embassy",
                "Pay visa fees",
                "Schedule interview if required",
            ],
            "notification": "Good luck! You've prepared well. Submit your application and wait for the embassy response.",
        }
    )

    return {
        "total_duration_months": 9,
        "milestones": milestones,
        "estimated_completion": "9 months from now",
        "cost_to_follow_plan": 0,
        "notification_channels": ["Email", "SMS", "WhatsApp"],
        "tip": "Following this plan systematically improves your approval chances significantly!",
    }
