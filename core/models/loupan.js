module.exports = (sequelize, DataTypes) => {

    let model = sequelize.define('Loupan', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true
        },
        createDate: {
            type: DataTypes.DATE
        },
        name: {
            type: DataTypes.STRING(255)
        },
        aliasName: {type: DataTypes.STRING(64)},
        source: {type: DataTypes.STRING(64)},
        province: {type: DataTypes.STRING(64)},
        provinceCode: {type: DataTypes.STRING(64)},
        city: {type: DataTypes.STRING(64)},
        cityCode: {type: DataTypes.STRING(64)},
        area: {type: DataTypes.STRING(64)},
        areaCode: {type: DataTypes.STRING(64)},
        locationPlate: {type: DataTypes.STRING(64)},
        locationPlateId: {type: DataTypes.INTEGER},
        street: {type: DataTypes.STRING(255)},
        streetId: {type: DataTypes.INTEGER},
        address: {type: DataTypes.STRING(255)},
        propertyType: {type: DataTypes.STRING(64)},
        propertyAge: {type: DataTypes.STRING(64)},
        developerName: {type: DataTypes.STRING(255)},
        developerId: {type: DataTypes.INTEGER},
        investorName: {type: DataTypes.STRING(255)},
        investorId: {type: DataTypes.INTEGER},
        propertyName: {type: DataTypes.STRING(255)},
        propertyId: {type: DataTypes.INTEGER},
        propertyFee: {type: DataTypes.STRING(255)},
        latitude: {type: DataTypes.DECIMAL(10, 10)},
        longitude: {type: DataTypes.DECIMAL(10, 10)},
        loopLine: {type: DataTypes.STRING(64)},
        promotionName: {type: DataTypes.STRING(64)},
        developmentNumber: {type: DataTypes.STRING(64)},
        buildingType: {type: DataTypes.STRING(64)},
        floorAmount: {type: DataTypes.INTEGER},
        startTime: {type: DataTypes.STRING(64)},
        completionTime: {type: DataTypes.STRING(64)},
        greeningRate: {type: DataTypes.DECIMAL(10, 4)},
        volumeRate: {type: DataTypes.DECIMAL(10, 4)},
        zipCode: {type: DataTypes.STRING(6)},
        areaAmount: {type: DataTypes.INTEGER},
        buildingFloorAmount: {type: DataTypes.INTEGER},
        buildingAmount: {type: DataTypes.INTEGER},
        parkingAmount: {type: DataTypes.INTEGER},
        totalHouseholds: {type: DataTypes.INTEGER},
        parkingRate: {type: DataTypes.DECIMAL(10, 4)},
        decorationStandard: {type: DataTypes.STRING(20)},
        sellAddress: {type: DataTypes.STRING(100)},
        sellPhone: {type: DataTypes.STRING(100)},
        averagePrice: {type: DataTypes.INTEGER},
        averagePriceUnit: {type: DataTypes.STRING(10)},
        introduction: {type: DataTypes.STRING(1000)},
        tags: {type: DataTypes.STRING(1000)},
        jobProgress: {type: DataTypes.STRING(120)},
        serialNumber: {type: DataTypes.STRING(128)},
    }, {
        tableName: 'xiwa_redstar_loupan',
        createdAt: false,
        updatedAt: false,
        deletedAt: false
    });

    return model;
};


