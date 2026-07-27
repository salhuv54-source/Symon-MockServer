<System Name="LargeSystem" Id="2" FFConvertFile="LargeSystem_FFConvertExport.xml" SchemaVer="3.0" DataVer="1.03" SoftwareVersion="2.1.9" ReleaseTimeTag="08/07/2026 16:00:00">
	<NodeTypes>
		<Node NTI="0" TI="0" TTI="0" Name="LargeSystem" IsPhysical="False" IsCritical="False" InitFss="UK" InitPss="NA" NTT="System">
			<Node NTI="1" TI="1" TTI="1" Name="RadarSubSystem" IsPhysical="False" IsCritical="False" InitFss="UK" InitPss="NA" NTT="Sub System">
				<Node NTI="2" TI="2" TTI="2" Name="TransmitterLRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="LRU">
					<Node NTI="3" TI="3" TTI="3" Name="PowerAmpSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
					<Node NTI="4" TI="4" TTI="4" Name="CoolingSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
				</Node>
				<Node NTI="5" TI="5" TTI="5" Name="ReceiverLRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="LRU">
					<Node NTI="6" TI="6" TTI="6" Name="SignalProcSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
					<Node NTI="7" TI="7" TTI="7" Name="DigitizerSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
				</Node>
			</Node>
			<Node NTI="8" TI="8" TTI="8" Name="CommSubSystem" IsPhysical="False" IsCritical="False" InitFss="UK" InitPss="NA" NTT="Sub System">
				<Node NTI="9" TI="9" TTI="9" Name="RadioLRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="LRU">
					<Node NTI="10" TI="10" TTI="10" Name="ModemSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
					<Node NTI="11" TI="11" TTI="11" Name="RfAmpSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
				</Node>
				<Node NTI="12" TI="12" TTI="12" Name="CryptoLRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="LRU">
					<Node NTI="13" TI="13" TTI="13" Name="KeyManagerSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
					<Node NTI="14" TI="14" TTI="14" Name="EncryptorSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
				</Node>
			</Node>
			<Node NTI="15" TI="15" TTI="15" Name="NavSubSystem" IsPhysical="False" IsCritical="False" InitFss="UK" InitPss="NA" NTT="Sub System">
				<Node NTI="16" TI="16" TTI="16" Name="InertialNavLRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="LRU">
					<Node NTI="17" TI="17" TTI="17" Name="GyroscopeSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
					<Node NTI="18" TI="18" TTI="18" Name="AccelerometerSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
				</Node>
				<Node NTI="19" TI="19" TTI="19" Name="GpsLRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="LRU">
					<Node NTI="20" TI="20" TTI="20" Name="GpsAntennaSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
					<Node NTI="21" TI="21" TTI="21" Name="GpsReceiverSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
				</Node>
			</Node>
			<Node NTI="22" TI="22" TTI="22" Name="PowerSubSystem" IsPhysical="False" IsCritical="False" InitFss="UK" InitPss="NA" NTT="Sub System">
				<Node NTI="23" TI="23" TTI="23" Name="MainPowerUnitLRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="LRU">
					<Node NTI="24" TI="24" TTI="24" Name="PowerSupplySRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
					<Node NTI="25" TI="25" TTI="25" Name="VoltageRegulatorSRU" IsPhysical="True" IsCritical="False" InitFss="UK" InitPss="UK" NTT="SRU" />
				</Node>
			</Node>
		</Node>
	</NodeTypes>
	<NodeTypeSuppliers>
		<Supplier Name="PowerSupplySRU" NTI="24" FatherNTI="3" />
		<Supplier Name="PowerSupplySRU" NTI="24" FatherNTI="6" />
		<Supplier Name="PowerSupplySRU" NTI="24" FatherNTI="10" />
		<Supplier Name="PowerSupplySRU" NTI="24" FatherNTI="17" />
	</NodeTypeSuppliers>
	<Indications>
		<Indication Name="BIT_E_RADAR_OVERHEAT" />
		<Indication Name="BIT_E_COMM_LINK_LOSS" />
		<Indication Name="BIT_E_GPS_LOCK_LOST" />
		<Indication Name="BIT_E_POWER_DROP" />
		<Indication Name="BIT_E_CRYPTO_EXPIRED" />
		<Indication Name="BIT_E_GYRO_DRIFT" />
		<Indication Name="BIT_F_TRANSMITTER_FAULT" />
		<Indication Name="BIT_F_SIGNAL_PROC_FAULT" />
		<Indication Name="BIT_F_MODEM_FAULT" />
		<Indication Name="BIT_F_ENCRYPTOR_FAULT" />
		<Indication Name="BIT_F_GYRO_FAULT" />
		<Indication Name="BIT_F_GPS_FAULT" />
		<Indication Name="BIT_F_POWER_SUPPLY_FAULT" />
		<Indication Name="BIT_F_VOLTAGE_FAULT" />
	</Indications>
	<Events>
		<Event ID="0" Name="BIT_E_RADAR_OVERHEAT" Desc="Radar Transmitter Power Amp Overheat" NTI="3" AcquitParent="True" Severity="NG" Notification="Fail" />
		<Event ID="1" Name="BIT_E_COMM_LINK_LOSS" Desc="Communication Modem Link Loss" NTI="10" AcquitParent="False" Severity="NG" Notification="Fail" />
		<Event ID="2" Name="BIT_E_GPS_LOCK_LOST" Desc="GPS Receiver Satellite Lock Lost" NTI="21" AcquitParent="False" Severity="NG" Notification="Fail" />
		<Event ID="3" Name="BIT_E_POWER_DROP" Desc="Power Subsystem Voltage Drop Detected" NTI="25" AcquitParent="True" Severity="NG" Notification="Fail" />
		<Event ID="4" Name="BIT_E_CRYPTO_EXPIRED" Desc="Encryption Key Expiration Event" NTI="13" AcquitParent="False" Severity="NG" Notification="Fail" />
		<Event ID="5" Name="BIT_E_GYRO_DRIFT" Desc="Inertial Navigation Gyroscope Drift Exceeded" NTI="17" AcquitParent="False" Severity="NG" Notification="Fail" />
	</Events>
	<Faults>
		<Fault ID="0" Name="BIT_F_TRANSMITTER_FAULT" Desc="Radar Power Amp Hardware Failure" NTI="3" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="1" Name="BIT_F_SIGNAL_PROC_FAULT" Desc="Signal Processor DSP Board Fault" NTI="6" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="2" Name="BIT_F_MODEM_FAULT" Desc="Comm Radio Modem Board Fault" NTI="10" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="3" Name="BIT_F_ENCRYPTOR_FAULT" Desc="Crypto Unit Hardware Accel Fault" NTI="14" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="4" Name="BIT_F_GYRO_FAULT" Desc="Gyroscope Sensor Disconnected" NTI="17" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="5" Name="BIT_F_GPS_FAULT" Desc="GPS Antenna Pre-Amp Failure" NTI="20" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="6" Name="BIT_F_POWER_SUPPLY_FAULT" Desc="Power Supply AC-DC Converter Overload" NTI="24" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
		<Fault ID="7" Name="BIT_F_VOLTAGE_FAULT" Desc="Voltage Regulator Output Out of Range" NTI="25" Severity="NG" Notification="Fail" FaultAccusalPercent="100.000" />
	</Faults>
	<PropagationRules>
		<Rule TTI="0" />
		<Rule TTI="1" />
		<Rule TTI="8" />
		<Rule TTI="15" />
		<Rule TTI="22" />
	</PropagationRules>
	<DistributionRules>
		<Rule EventID="0" FaultID="0" RefSystemName="" LPF="1" EventNTI="3" FaultNTI="3" />
		<Rule EventID="1" FaultID="2" RefSystemName="" LPF="1" EventNTI="10" FaultNTI="10" />
		<Rule EventID="2" FaultID="5" RefSystemName="" LPF="1" EventNTI="21" FaultNTI="20" />
		<Rule EventID="3" FaultID="7" RefSystemName="" LPF="1" EventNTI="25" FaultNTI="25" />
		<Rule EventID="4" FaultID="3" RefSystemName="" LPF="1" EventNTI="13" FaultNTI="14" />
		<Rule EventID="5" FaultID="4" RefSystemName="" LPF="1" EventNTI="17" FaultNTI="17" />
	</DistributionRules>
	<Instances>
		<Instance Name="LargeSystem" SN="1" HMI="20000001" InitPss="NA" NTI="0">
			<Instance Name="RadarSubSystem" SN="1" HMI="20000002" InitPss="NA" NTI="1">
				<Instance Name="TransmitterLRU" SN="1" HMI="20000003" NTI="2">
					<Instance Name="PowerAmpSRU #1" SN="1" HMI="20000004" NTI="3" />
					<Instance Name="PowerAmpSRU #2" SN="2" HMI="20000005" NTI="3" />
					<Instance Name="CoolingSRU" SN="1" HMI="20000006" NTI="4" />
				</Instance>
				<Instance Name="ReceiverLRU" SN="1" HMI="20000007" NTI="5">
					<Instance Name="SignalProcSRU #1" SN="1" HMI="20000008" NTI="6" />
					<Instance Name="SignalProcSRU #2" SN="2" HMI="20000009" NTI="6" />
					<Instance Name="DigitizerSRU" SN="1" HMI="20000010" NTI="7" />
				</Instance>
			</Instance>
			<Instance Name="CommSubSystem" SN="1" HMI="20000011" InitPss="NA" NTI="8">
				<Instance Name="RadioLRU" SN="1" HMI="20000012" NTI="9">
					<Instance Name="ModemSRU #1" SN="1" HMI="20000013" NTI="10" />
					<Instance Name="ModemSRU #2" SN="2" HMI="20000014" NTI="10" />
					<Instance Name="RfAmpSRU" SN="1" HMI="20000015" NTI="11" />
				</Instance>
				<Instance Name="CryptoLRU" SN="1" HMI="20000016" NTI="12">
					<Instance Name="KeyManagerSRU" SN="1" HMI="20000017" NTI="13" />
					<Instance Name="EncryptorSRU" SN="1" HMI="20000018" NTI="14" />
				</Instance>
			</Instance>
			<Instance Name="NavSubSystem" SN="1" HMI="20000019" InitPss="NA" NTI="15">
				<Instance Name="InertialNavLRU" SN="1" HMI="20000020" NTI="16">
					<Instance Name="GyroscopeSRU #1" SN="1" HMI="20000021" NTI="17" />
					<Instance Name="GyroscopeSRU #2" SN="2" HMI="20000022" NTI="17" />
					<Instance Name="AccelerometerSRU" SN="1" HMI="20000023" NTI="18" />
				</Instance>
				<Instance Name="GpsLRU" SN="1" HMI="20000024" NTI="19">
					<Instance Name="GpsAntennaSRU" SN="1" HMI="20000025" NTI="20" />
					<Instance Name="GpsReceiverSRU" SN="1" HMI="20000026" NTI="21" />
				</Instance>
			</Instance>
			<Instance Name="PowerSubSystem" SN="1" HMI="20000027" InitPss="NA" NTI="22">
				<Instance Name="MainPowerUnitLRU" SN="1" HMI="20000028" NTI="23">
					<Instance Name="PowerSupplySRU #1" SN="1" HMI="20000029" NTI="24" />
					<Instance Name="PowerSupplySRU #2" SN="2" HMI="20000030" NTI="24" />
					<Instance Name="PowerSupplySRU #3" SN="3" HMI="20000031" NTI="24" />
					<Instance Name="PowerSupplySRU #4" SN="4" HMI="20000032" NTI="24" />
					<Instance Name="VoltageRegulatorSRU #1" SN="1" HMI="20000033" NTI="25" />
					<Instance Name="VoltageRegulatorSRU #2" SN="2" HMI="20000034" NTI="25" />
				</Instance>
			</Instance>
		</Instance>
	</Instances>
	<Suppliers>
		<Supplier Name="PowerSupplySRU #1" HMI="20000029" Father="20000004" TTI="24" />
		<Supplier Name="PowerSupplySRU #2" HMI="20000030" Father="20000008" TTI="24" />
		<Supplier Name="PowerSupplySRU #3" HMI="20000031" Father="20000013" TTI="24" />
		<Supplier Name="PowerSupplySRU #4" HMI="20000032" Father="20000021" TTI="24" />
	</Suppliers>
	<Vss SchemaVer="2.1.9" DataVer="1.03" SystemName="LargeSystem">
		<Definitions />
		<References />
		<EventDefs />
		<EventRefs />
	</Vss>
</System>
