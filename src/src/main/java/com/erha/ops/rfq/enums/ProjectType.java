package com.erha.ops.rfq.enums;

/**
 * Project Type Enumeration
 * Categorizes the type of fabrication work
 */
public enum ProjectType {
    STRUCTURAL_STEEL("Structural Steel", "Building and construction steelwork"),
    PRESSURE_VESSELS("Pressure Vessels", "ASME/SABS pressure vessel fabrication"),
    PIPING_SYSTEMS("Piping Systems", "Industrial piping and plumbing"),
    TANKS_STORAGE("Tanks & Storage", "Storage tanks and containment systems"),
    CONVEYORS("Conveyors", "Material handling equipment"),
    PLATFORMS_WALKWAYS("Platforms & Walkways", "Access structures and platforms"),
    HANDRAILS_BALUSTRADES("Handrails & Balustrades", "Safety barriers and railings"),
    MECHANICAL_ASSEMBLIES("Mechanical Assemblies", "Custom mechanical components"),
    REPAIRS_MAINTENANCE("Repairs & Maintenance", "Repair and refurbishment work"),
    PROTOTYPES("Prototypes", "Prototype and development projects"),
    CUSTOM_FABRICATION("Custom Fabrication", "Specialized custom work"),
    MINING_EQUIPMENT("Mining Equipment", "Mining industry specific equipment"),
    AGRICULTURAL_EQUIPMENT("Agricultural Equipment", "Farm and agricultural machinery"),
    OTHER("Other", "Other fabrication work not listed");
    
    private final String displayName;
    private final String description;
    
    ProjectType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }
    
    public boolean requiresSpecialSafety() {
        return this == PRESSURE_VESSELS || this == TANKS_STORAGE || this == MINING_EQUIPMENT;
    }
    
    public boolean requiresISO9001() {
        return this == PRESSURE_VESSELS || this == MECHANICAL_ASSEMBLIES || this == MINING_EQUIPMENT;
    }
}
