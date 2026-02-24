import pandas as pd
from datetime import datetime
import numpy as np

# Load the CSV files
premiums = pd.read_csv('premiums.csv')
payments = pd.read_csv('payments.csv')

print("=" * 100)
print("DATA LOADING AND PREPARATION")
print("=" * 100)

# Convert ReconDate to datetime with flexible parsing
def parse_date(date_str):
    """Parse dates in multiple formats"""
    if pd.isna(date_str):
        return pd.NaT
    
    date_str = str(date_str).strip()
    
    # Try different date formats
    formats = ['%d/%m/%Y', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d']
    
    for fmt in formats:
        try:
            return pd.to_datetime(date_str, format=fmt)
        except:
            continue
    
    # If all fail, let pandas try to parse it
    try:
        return pd.to_datetime(date_str)
    except:
        print(f"Warning: Could not parse date: {date_str}")
        return pd.NaT

premiums['ReconDate'] = premiums['ReconDate'].apply(parse_date)
payments['ReconDate'] = payments['ReconDate'].apply(parse_date)

# Create unique identifiers for tracking
premiums['PremiumID'] = ['PREM_' + str(i+1).zfill(5) for i in range(len(premiums))]
payments['PaymentID'] = ['PAY_' + str(payments.loc[i, 'ID']).zfill(5) if 'ID' in payments.columns else 'PAY_' + str(i+1).zfill(5) for i in range(len(payments))]

# Ensure BizID is treated as string for consistent matching
premiums['BizID'] = premiums['BizID'].astype(str)
payments['BizID'] = payments['BizID'].astype(str)

print(f"Loaded {len(premiums)} premiums and {len(payments)} payments")
print(f"Date range for premiums: {premiums['ReconDate'].min()} to {premiums['ReconDate'].max()}")
print(f"Date range for payments: {payments['ReconDate'].min()} to {payments['ReconDate'].max()}")
print(f"Unique businesses in premiums: {premiums['BizID'].nunique()}")
print(f"Unique businesses in payments: {payments['BizID'].nunique()}")
print("\n")

# Function to allocate payments to premiums with tolerance
def allocate_payments_to_premiums(premiums_df, payments_df, tolerance=1):
    """
    Allocate payments to premiums by business, applying oldest-first logic.
    Tolerance allows for minor differences (+/- tolerance) when matching amounts.
    """
    
    # Create copies to work with
    premiums_work = premiums_df.copy()
    payments_work = payments_df.copy()
    
    # Add allocation tracking columns
    premiums_work['AllocatedAmount'] = 0.0
    premiums_work['PaymentIDs_Used'] = ''
    premiums_work['Status'] = 'Unpaid'
    premiums_work['Shortfall'] = premiums_work['Amount']
    
    payments_work['AllocatedAmount'] = 0.0
    payments_work['PremiumIDs_Covered'] = ''
    payments_work['FullyUtilized'] = False
    payments_work['RemainingAmount'] = payments_work['Amount']
    
    # Process each business separately
    for biz_id in premiums_work['BizID'].unique():
        biz_premiums = premiums_work[premiums_work['BizID'] == biz_id].sort_values('ReconDate')
        biz_payments = payments_work[payments_work['BizID'] == biz_id].sort_values('ReconDate')
        
        if len(biz_payments) == 0:
            continue  # No payments for this business
        
        # Process each payment for this business
        for pay_idx, payment_row in biz_payments.iterrows():
            payment_id = payment_row['PaymentID']
            payment_date = payment_row['ReconDate']
            remaining_payment = payment_row['Amount']
            premiums_covered = []
            
            if remaining_payment <= tolerance:
                continue  # Payment amount too small
            
            # Strategy 1: Try to match exact amount on same date first
            same_date_premiums = biz_premiums[
                (biz_premiums['ReconDate'] == payment_date) & 
                (biz_premiums['Status'] == 'Unpaid')
            ]
            
            for prem_idx, prem_row in same_date_premiums.iterrows():
                prem_amount = prem_row['Amount']
                if abs(remaining_payment - prem_amount) <= tolerance and remaining_payment > tolerance:
                    # Exact match (within tolerance)
                    premiums_work.loc[prem_idx, 'AllocatedAmount'] = prem_amount
                    premiums_work.loc[prem_idx, 'PaymentIDs_Used'] = payment_id
                    premiums_work.loc[prem_idx, 'Status'] = 'Fully Paid'
                    premiums_work.loc[prem_idx, 'Shortfall'] = 0.0
                    
                    payments_work.loc[pay_idx, 'AllocatedAmount'] += prem_amount
                    payments_work.loc[pay_idx, 'RemainingAmount'] -= prem_amount
                    premiums_covered.append(prem_row['PremiumID'])
                    remaining_payment -= prem_amount
                    break
            
            # Strategy 2: If payment can cover multiple premiums, allocate oldest first
            if remaining_payment > tolerance:
                # Get all unpaid premiums for this business (oldest first)
                unpaid_premiums = premiums_work[
                    (premiums_work['BizID'] == biz_id) & 
                    (premiums_work['Status'] == 'Unpaid')
                ].sort_values('ReconDate')
                
                for prem_idx, prem_row in unpaid_premiums.iterrows():
                    if remaining_payment <= tolerance:
                        break
                    
                    prem_amount = prem_row['Amount']
                    prem_id = prem_row['PremiumID']
                    
                    # Check if we can fully cover this premium
                    if remaining_payment >= prem_amount - tolerance:
                        # Fully cover this premium
                        premiums_work.loc[prem_idx, 'AllocatedAmount'] = prem_amount
                        
                        # Append to existing PaymentIDs if any
                        existing_payments = premiums_work.loc[prem_idx, 'PaymentIDs_Used']
                        if existing_payments:
                            premiums_work.loc[prem_idx, 'PaymentIDs_Used'] = existing_payments + ', ' + payment_id
                        else:
                            premiums_work.loc[prem_idx, 'PaymentIDs_Used'] = payment_id
                        
                        premiums_work.loc[prem_idx, 'Status'] = 'Fully Paid'
                        premiums_work.loc[prem_idx, 'Shortfall'] = 0.0
                        
                        payments_work.loc[pay_idx, 'AllocatedAmount'] += prem_amount
                        payments_work.loc[pay_idx, 'RemainingAmount'] -= prem_amount
                        premiums_covered.append(prem_id)
                        remaining_payment -= prem_amount
            
            # Update payment record with covered premiums
            if premiums_covered:
                payments_work.loc[pay_idx, 'PremiumIDs_Covered'] = ', '.join(premiums_covered)
            
            # Mark if payment is fully utilized
            if abs(payments_work.loc[pay_idx, 'RemainingAmount']) <= tolerance:
                payments_work.loc[pay_idx, 'FullyUtilized'] = True
    
    return premiums_work, payments_work

# Perform the allocation
print("=" * 100)
print("PERFORMING RECONCILIATION...")
print("=" * 100)
reconciled_premiums, reconciled_payments = allocate_payments_to_premiums(premiums, payments, tolerance=1)
print("Reconciliation complete!\n")

# Calculate summary statistics
total_premiums_amount = reconciled_premiums['Amount'].sum()
total_payments_amount = reconciled_payments['Amount'].sum()
total_allocated = reconciled_premiums['AllocatedAmount'].sum()
total_shortfall = reconciled_premiums['Shortfall'].sum()

fully_paid_count = len(reconciled_premiums[reconciled_premiums['Status'] == 'Fully Paid'])
unpaid_count = len(reconciled_premiums[reconciled_premiums['Status'] == 'Unpaid'])

print("=" * 100)
print("RECONCILIATION SUMMARY")
print("=" * 100)
print(f"Total Premiums Expected:     ${total_premiums_amount:,.2f}")
print(f"Total Payments Received:     ${total_payments_amount:,.2f}")
print(f"Total Amount Allocated:      ${total_allocated:,.2f}")
print(f"Total Shortfall:             ${total_shortfall:,.2f}")
print(f"\nPremiums Fully Paid:         {fully_paid_count} ({fully_paid_count/len(reconciled_premiums)*100:.1f}%)")
print(f"Premiums Unpaid:             {unpaid_count} ({unpaid_count/len(reconciled_premiums)*100:.1f}%)")
print("\n")

# Separate into fully paid and unpaid
fully_paid = reconciled_premiums[reconciled_premiums['Status'] == 'Fully Paid'].copy()
unpaid_premiums = reconciled_premiums[reconciled_premiums['Status'] == 'Unpaid'].copy()

print("=" * 100)
print("SAMPLE FULLY PAID PREMIUMS (First 10)")
print("=" * 100)
print(fully_paid[['PremiumID', 'BizID', 'Amount', 'ReconDate', 'AllocatedAmount', 'PaymentIDs_Used']].head(10))
print(f"\nTotal Fully Paid: {len(fully_paid)} records")
print(f"Total Amount Paid: ${fully_paid['Amount'].sum():,.2f}")
print("\n")

print("=" * 100)
print("SAMPLE UNPAID PREMIUMS (First 10)")
print("=" * 100)
print(unpaid_premiums[['PremiumID', 'BizID', 'Amount', 'ReconDate', 'Shortfall']].head(10))
print(f"\nTotal Unpaid: {len(unpaid_premiums)} records")
print(f"Total Amount Due: ${unpaid_premiums['Amount'].sum():,.2f}")
print(f"Total Shortfall: ${unpaid_premiums['Shortfall'].sum():,.2f}")
print("\n")

# Business Summary
print("=" * 100)
print("BUSINESS SUMMARY (Top 20 by Total Premium)")
print("=" * 100)
business_summary = reconciled_premiums.groupby('BizID').agg({
    'Amount': 'sum',
    'AllocatedAmount': 'sum',
    'Shortfall': 'sum'
}).reset_index()
business_summary.columns = ['BizID', 'Total_Premium', 'Total_Allocated', 'Total_Shortfall']
business_summary['Num_Premiums'] = reconciled_premiums.groupby('BizID').size().values
business_summary['Num_Paid'] = reconciled_premiums[reconciled_premiums['Status'] == 'Fully Paid'].groupby('BizID').size().reindex(business_summary['BizID'], fill_value=0).values
business_summary['Num_Unpaid'] = reconciled_premiums[reconciled_premiums['Status'] == 'Unpaid'].groupby('BizID').size().reindex(business_summary['BizID'], fill_value=0).values
business_summary['Payment_Status'] = business_summary.apply(
    lambda row: 'Fully Paid' if abs(row['Total_Shortfall']) <= 1 else 
                'Partially Paid' if row['Total_Allocated'] > 0 else 'Not Paid',
    axis=1
)
business_summary = business_summary.sort_values('Total_Premium', ascending=False)
print(business_summary.head(20))
print("\n")

# Payment Utilization Summary
print("=" * 100)
print("PAYMENT UTILIZATION SUMMARY (First 20)")
print("=" * 100)
payment_utilization = reconciled_payments.copy()
payment_utilization['Utilization_%'] = (payment_utilization['AllocatedAmount'] / payment_utilization['Amount'] * 100).round(2)
payment_utilization = payment_utilization.sort_values('Amount', ascending=False)
print(payment_utilization[['PaymentID', 'BizID', 'Amount', 'AllocatedAmount', 
                          'RemainingAmount', 'Utilization_%', 'FullyUtilized', 'PremiumIDs_Covered']].head(20))
print("\n")

# Businesses with issues
print("=" * 100)
print("BUSINESSES WITH PAYMENT ISSUES (Partially Paid or Not Paid)")
print("=" * 100)
issues = business_summary[business_summary['Payment_Status'].isin(['Partially Paid', 'Not Paid'])].copy()
print(f"Total businesses with issues: {len(issues)}")
print(issues.head(20))
print("\n")

# Save all results
print("=" * 100)
print("SAVING RESULTS TO CSV FILES...")
print("=" * 100)

reconciled_premiums.to_csv('reconciled_premiums.csv', index=False)
reconciled_payments.to_csv('reconciled_payments.csv', index=False)
fully_paid.to_csv('fully_paid_premiums.csv', index=False)
unpaid_premiums.to_csv('unpaid_premiums.csv', index=False)
business_summary.to_csv('business_summary.csv', index=False)
payment_utilization.to_csv('payment_utilization.csv', index=False)
issues.to_csv('businesses_with_issues.csv', index=False)

print("✓ reconciled_premiums.csv - All premiums with allocation details")
print("✓ reconciled_payments.csv - All payments with utilization details")
print("✓ fully_paid_premiums.csv - Only fully paid premiums")
print("✓ unpaid_premiums.csv - Only unpaid premiums")
print("✓ business_summary.csv - Summary by business")
print("✓ payment_utilization.csv - Payment utilization analysis")
print("✓ businesses_with_issues.csv - Businesses with partial or no payment")
print("\n")

# Show some detailed allocation examples
print("=" * 100)
print("DETAILED ALLOCATION EXAMPLES")
print("=" * 100)
# Find businesses with multiple premiums covered by one payment
multi_coverage = payment_utilization[
    payment_utilization['PremiumIDs_Covered'].str.contains(',', na=False)
].head(5)

if len(multi_coverage) > 0:
    print("\nExamples of payments covering multiple premiums:")
    for idx, pay in multi_coverage.iterrows():
        print(f"\nBizID: {pay['BizID']}")
        print(f"  Payment: {pay['PaymentID']} (${pay['Amount']:,.2f})")
        print(f"  Covered Premiums: {pay['PremiumIDs_Covered']}")
        print(f"  Allocated: ${pay['AllocatedAmount']:,.2f}, Remaining: ${pay['RemainingAmount']:,.2f}")
        print(f"  Utilization: {pay['Utilization_%']}%")
else:
    print("\nNo payments covering multiple premiums found.")

print("\n")
print("=" * 100)
print("RECONCILIATION COMPLETE!")
print("=" * 100)