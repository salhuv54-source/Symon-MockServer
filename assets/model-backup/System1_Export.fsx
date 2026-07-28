<System Name="System1" Id="1" FFConvertFile="System1_FFConvertExport.xml" SchemaVer="3.0" DataVer="1.03" SoftwareVersion="2.1.9" ReleaseTimeTag="08/07/2026 15:49:50">
	<NodeTypes>
		<Node NTI="0" TI="0" TTI="0" Name="System1" IsPhysical="False" IsCritical="False" InitFss="UK" InitPss="NA" NTT="System">
			<Node NTI="1" TI="1" TTI="1" Name="SubSystem1" IsPhysical="False" IsCritical="False" InitFss="UK" InitPss="NA" NTT="Sub System">
				<Node NTI="2" TI="2" TTI="2" Name="Lru1" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="LRU">
					<Node NTI="3" TI="3" TTI="3" Name="Sru1" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
					<Node NTI="4" TI="4" TTI="4" Name="Sru2" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
				</Node>
				<Node NTI="5" TI="5" TTI="5" Name="PS" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
			</Node>
		</Node>
	</NodeTypes>
	<NodeTypeSuppliers>
		<Supplier Name="PS" NTI="5" FatherNTI="3" />
		<Supplier Name="PS" NTI="5" FatherNTI="4" />
	</NodeTypeSuppliers>
	<Indications>
		<Indication Name="BIT_E_SRU2_EVENT" />
		<Indication Name="BIT_F_SRU2_FAULT" />
		<Indication Name="BIT_F_PS_FAULT1" />
		<Indication Name="BIT_F_PS_FAULT2" />
	</Indications>
	<Events>
		<Event ID="0" Name="BIT_E_SRU2_EVENT" Desc="Sru2 event" NTI="3" AcquitParent="True" Severity="NG" Notification="Fail" />
		<Event ID="0" Name="BIT_E_SRU2_EVENT" Desc="Enter description here." NTI="4" AcquitParent="False" Severity="NG" Notification="Fail" />
	</Events>
	<Faults>
		<Fault ID="0" Name="BIT_F_SRU2_FAULT" Desc="Fault Sru2" NTI="3" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="0" Name="BIT_F_SRU2_FAULT" Desc="Enter description here." NTI="4" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="0" Name="BIT_F_PS_FAULT1" Desc="Enter description here." NTI="5" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="1" Name="BIT_F_PS_FAULT2" Desc="Enter description here." NTI="5" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
	</Faults>
	<PropagationRules>
		<Rule TTI="0">
			<Moon Type="Functional" Source="GO" Target="GO" Count="-1" />
			<Moon Type="Functional" Source="UK" Target="UK" Count="-1" />
			<Moon Type="Functional" Source="DG" Target="DG" Count="1" />
			<Moon Type="Functional" Source="DG" Target="NG" Count="-1" />
			<Moon Type="Functional" Source="NG" Target="DG" Count="-1" />
			<Moon Type="Functional" Source="NG" Target="NG" Count="1" />
			<Moon Type="Physical" Source="GO" Target="GO" Count="-1" />
			<Moon Type="Physical" Source="UK" Target="UK" Count="-1" />
			<Moon Type="Physical" Source="DG" Target="DG" Count="1" />
			<Moon Type="Physical" Source="DG" Target="NG" Count="-1" />
			<Moon Type="Physical" Source="NG" Target="DG" Count="-1" />
			<Moon Type="Physical" Source="NG" Target="NG" Count="1" />
		</Rule>
		<Rule TTI="1" />
		<Rule TTI="2" />
		<Rule TTI="3">
			<Moon Type="Functional" Source="GO" Target="GO" Count="-1" />
			<Moon Type="Functional" Source="UK" Target="UK" Count="-1" />
			<Moon Type="Functional" Source="DG" Target="DG" Count="1" />
			<Moon Type="Functional" Source="DG" Target="NG" Count="-1" />
			<Moon Type="Functional" Source="NG" Target="DG" Count="-1" />
			<Moon Type="Functional" Source="NG" Target="NG" Count="1" />
			<Moon Type="Physical" Source="GO" Target="GO" Count="-1" />
			<Moon Type="Physical" Source="UK" Target="UK" Count="-1" />
			<Moon Type="Physical" Source="DG" Target="DG" Count="1" />
			<Moon Type="Physical" Source="DG" Target="NG" Count="-1" />
			<Moon Type="Physical" Source="NG" Target="DG" Count="-1" />
			<Moon Type="Physical" Source="NG" Target="NG" Count="1" />
		</Rule>
		<Rule TTI="4">
			<Moon Type="Functional" Source="GO" Target="GO" Count="-1" />
			<Moon Type="Functional" Source="UK" Target="UK" Count="-1" />
			<Moon Type="Functional" Source="DG" Target="DG" Count="1" />
			<Moon Type="Functional" Source="DG" Target="NG" Count="-1" />
			<Moon Type="Functional" Source="NG" Target="DG" Count="-1" />
			<Moon Type="Functional" Source="NG" Target="NG" Count="2" />
			<Moon Type="Physical" Source="GO" Target="GO" Count="-1" />
			<Moon Type="Physical" Source="UK" Target="UK" Count="-1" />
			<Moon Type="Physical" Source="DG" Target="DG" Count="1" />
			<Moon Type="Physical" Source="DG" Target="NG" Count="-1" />
			<Moon Type="Physical" Source="NG" Target="DG" Count="-1" />
			<Moon Type="Physical" Source="NG" Target="NG" Count="2" />
		</Rule>
		<Rule TTI="5">
			<Moon Type="Functional" Source="GO" Target="GO" Count="-1" />
			<Moon Type="Functional" Source="UK" Target="UK" Count="-1" />
			<Moon Type="Functional" Source="DG" Target="DG" Count="2" />
			<Moon Type="Functional" Source="DG" Target="NG" Count="-1" />
			<Moon Type="Functional" Source="NG" Target="DG" Count="-1" />
			<Moon Type="Functional" Source="NG" Target="NG" Count="2" />
			<Moon Type="Physical" Source="GO" Target="GO" Count="-1" />
			<Moon Type="Physical" Source="UK" Target="UK" Count="-1" />
			<Moon Type="Physical" Source="DG" Target="DG" Count="2" />
			<Moon Type="Physical" Source="DG" Target="NG" Count="-1" />
			<Moon Type="Physical" Source="NG" Target="DG" Count="-1" />
			<Moon Type="Physical" Source="NG" Target="NG" Count="2" />
		</Rule>
	</PropagationRules>
	<DistributionRules>
		<Rule EventID="0" FaultID="0" RefSystemName="" LPF="1" EventNTI="3" FaultNTI="3" />
		<Rule EventID="0" FaultID="0" RefSystemName="" LPF="2" EventNTI="3" FaultNTI="5" />
		<Rule EventID="0" FaultID="1" RefSystemName="" LPF="3" EventNTI="3" FaultNTI="5" />
		<Rule EventID="0" FaultID="0" RefSystemName="" LPF="1" EventNTI="4" FaultNTI="4" />
		<Rule EventID="0" FaultID="0" RefSystemName="" LPF="2" EventNTI="4" FaultNTI="5" />
		<Rule EventID="0" FaultID="1" RefSystemName="" LPF="3" EventNTI="4" FaultNTI="5" />
	</DistributionRules>
	<Instances>
		<Instance Name="System1" SN="1" HMI="10000001" InitPss="NA" NTI="0">
			<Instance Name="SubSystem1" SN="1" HMI="10000002" InitPss="NA" NTI="1">
				<Instance Name="Lru1" SN="1" HMI="10000003" NTI="2">
					<Instance Name="Sru1" SN="1" HMI="10000004" NTI="3" />
					<Instance Name="Sru2 #1" SN="1" HMI="10000005" NTI="4" />
					<Instance Name="Sru2 #2" SN="2" HMI="10000006" NTI="4" />
					<Instance Name="Sru2 #3" SN="3" HMI="10000007" NTI="4" />
				</Instance>
				<Instance Name="PS #1" SN="1" HMI="10000008" NTI="5" />
				<Instance Name="PS #2" SN="2" HMI="10000009" NTI="5" />
				<Instance Name="PS #3" SN="3" HMI="10000010" NTI="5" />
				<Instance Name="PS #4" SN="4" HMI="10000011" NTI="5" />
			</Instance>
		</Instance>
	</Instances>
	<Suppliers>
		<Supplier Name="PS #1" HMI="10000008" Father="10000004" TTI="5" />
		<Supplier Name="PS #2" HMI="10000009" Father="10000005" TTI="5" />
		<Supplier Name="PS #3" HMI="10000010" Father="10000006" TTI="5" />
		<Supplier Name="PS #4" HMI="10000011" Father="10000007" TTI="5" />
	</Suppliers>
	<Vss SchemaVer="2.1.9" DataVer="1.03" SystemName="System1">
		<Definitions />
		<References />
		<EventDefs />
		<EventRefs />
	</Vss>
</System>